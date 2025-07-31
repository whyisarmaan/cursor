const Link = require('../models/Link');
const ClickEvent = require('../models/ClickEvent');
const { sendToMetaCAPI } = require('../services/metaCapiService');

// GET /links - Return all live redirect links
const getLinks = async (req, res) => {
  try {
    const links = await Link.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links',
      error: error.message
    });
  }
};

// POST /click/:linkId - Log the click and send event to Meta CAPI
const trackClick = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // Find the link
    const link = await Link.findById(linkId);
    if (!link || !link.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Link not found or inactive'
      });
    }

    // Extract user data from request
    const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;
    const referer = req.headers["referer"] || null;
    
    // Parse cookies for fbp/fbc
    const cookies = req.headers.cookie || "";
    let fbp = null;
    let fbc = null;
    
    if (cookies) {
      const fbpMatch = cookies.match(/_fbp=([^;]+)/);
      const fbcMatch = cookies.match(/_fbc=([^;]+)/);
      
      if (fbpMatch) fbp = fbpMatch[1];
      if (fbcMatch) fbc = fbcMatch[1];
    }

    // Create click event record
    const clickEvent = new ClickEvent({
      linkId,
      ipAddress,
      userAgent,
      referer,
      fbp,
      fbc
    });

    // Send to Meta CAPI
    let metaCapiResponse = null;
    let metaCapiSent = false;
    
    try {
      metaCapiResponse = await sendToMetaCAPI(req, linkId);
      metaCapiSent = true;
      clickEvent.metaCapiSent = true;
      clickEvent.metaCapiResponse = metaCapiResponse;
    } catch (metaError) {
      console.error('Meta CAPI failed:', metaError.message);
      clickEvent.metaCapiSent = false;
      clickEvent.metaCapiResponse = { error: metaError.message };
    }

    // Save click event
    await clickEvent.save();

    // Increment click count
    await Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });

    res.json({
      success: true,
      redirectUrl: link.url,
      metaCapiSent,
      data: {
        linkId,
        title: link.title,
        url: link.url,
        clickCount: link.clickCount + 1
      }
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

// POST /links - Create a new redirect link (admin use)
const createLink = async (req, res) => {
  try {
    const { title, url, description, order } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required'
      });
    }

    const link = new Link({
      title,
      url,
      description,
      order: order || 0
    });

    await link.save();

    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      data: link
    });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create link',
      error: error.message
    });
  }
};

// PATCH /links/:id - Edit or disable a link
const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.clickCount;

    const link = await Link.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    res.json({
      success: true,
      message: 'Link updated successfully',
      data: link
    });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update link',
      error: error.message
    });
  }
};

// GET /stats - Return basic link analytics
const getStats = async (req, res) => {
  try {
    const links = await Link.find().sort({ clickCount: -1 });
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    const totalLinks = links.length;
    const activeLinks = links.filter(link => link.isActive).length;

    // Get recent click events
    const recentClicks = await ClickEvent.find()
      .populate('linkId', 'title url')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get click analytics by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyClicks = await ClickEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalClicks,
        totalLinks,
        activeLinks,
        inactiveLinks: totalLinks - activeLinks,
        links: links.map(link => ({
          id: link._id,
          title: link.title,
          url: link.url,
          clickCount: link.clickCount,
          isActive: link.isActive,
          createdAt: link.createdAt
        })),
        recentClicks,
        dailyClicks
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

module.exports = {
  getLinks,
  trackClick,
  createLink,
  updateLink,
  getStats
};
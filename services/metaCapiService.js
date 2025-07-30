const axios = require("axios");

/**
 * Send raw user and technical data to Meta Conversions API
 * (No hashing of any fields, as per your instructions)
 */
async function sendToMetaCAPI(req, linkId = "unknown") {
  const {
    PIXEL_ID,
    META_ACCESS_TOKEN
  } = process.env;

  const event_time = Math.floor(Date.now() / 1000);
  const endpoint = `https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

  // Server-side data capture
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress || null;
  const userAgent = req.headers["user-agent"] || null;
  const referer = req.headers["referer"] || "https://yourdomain.com";

  // Cookie extraction for fbp/fbc
  const cookies = req.headers.cookie || "";
  
  // Parse _fbp and _fbc from cookies
  let fbp = null;
  let fbc = null;
  
  if (cookies) {
    const fbpMatch = cookies.match(/_fbp=([^;]+)/);
    const fbcMatch = cookies.match(/_fbc=([^;]+)/);
    
    if (fbpMatch) fbp = fbpMatch[1];
    if (fbcMatch) fbc = fbcMatch[1];
  }

  // Construct event payload
  const eventData = {
    data: [
      {
        event_name: "PageView",
        event_time: event_time,
        event_source_url: referer,
        user_data: {
          client_ip_address: ipAddress,
          client_user_agent: userAgent,
          fbp: fbp,
          fbc: fbc
        },
        custom_data: {
          link_id: linkId,
          event_type: "link_click",
          source: "linktree_backend"
        }
      }
    ]
  };

  try {
    const response = await axios.post(endpoint, eventData, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    console.log(`Meta CAPI event sent successfully for linkId: ${linkId}`);
    return response.data;
  } catch (error) {
    console.error("Meta CAPI error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendToMetaCAPI
};
const express = require('express');
const router = express.Router();
const {
  getLinks,
  trackClick,
  createLink,
  updateLink,
  getStats
} = require('../controllers/linkController');

// GET /links - Return all live redirect links
router.get('/links', getLinks);

// POST /click/:linkId - Log the click and send event to Meta CAPI
router.post('/click/:linkId', trackClick);

// POST /links - Create a new redirect link (admin use)
router.post('/links', createLink);

// PATCH /links/:id - Edit or disable a link
router.patch('/links/:id', updateLink);

// GET /stats - Return basic link analytics
router.get('/stats', getStats);

module.exports = router;
const express = require('express');
const router = express.Router();

// GET /health - Simple healthcheck route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Linktree backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
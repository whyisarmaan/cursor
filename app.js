const express = require('express');
const cors = require('cors');
const { connectDB, port } = require('./config');

// Import routes
const linkRoutes = require('./routes/linkRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', linkRoutes);
app.use('/', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Linktree Backend API',
    version: '1.0.0',
    endpoints: {
      'GET /links': 'Get all active links',
      'POST /click/:linkId': 'Track link click and send to Meta CAPI',
      'POST /links': 'Create new link (admin)',
      'PATCH /links/:id': 'Update link',
      'GET /stats': 'Get link analytics',
      'GET /health': 'Health check'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Linktree backend server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API docs: http://localhost:${port}/`);
});

module.exports = app;
# Linktree Backend API

A lightweight backend for a custom Linktree-style landing page, optimized for tracking user behavior and sending events to Meta's Conversions API (CAPI) for retargeting.

## 🛠️ Tech Stack

- **Node.js** (Latest LTS)
- **Express.js** - Web framework
- **MongoDB** - Database (local or MongoDB Atlas)
- **dotenv** - Environment configuration
- **axios** - HTTP client for Meta CAPI
- **mongoose** - MongoDB ODM

## 📦 Features

- ✅ Track link clicks with comprehensive user data
- ✅ Send events to Meta Conversions API (no hashing)
- ✅ Basic analytics and statistics
- ✅ CRUD operations for link management
- ✅ Health check endpoint
- ✅ Modular and clean architecture

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd linktree-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Environment Configuration

Update `.env` with your settings:

```ini
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/linktree

# Meta Conversions API Configuration
PIXEL_ID=your_pixel_id
META_ACCESS_TOKEN=your_access_token
```

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API documentation |
| `GET` | `/health` | Health check |
| `GET` | `/links` | Get all active links |
| `POST` | `/click/:linkId` | Track link click + Meta CAPI |
| `POST` | `/links` | Create new link (admin) |
| `PATCH` | `/links/:id` | Update/disable link |
| `GET` | `/stats` | Get analytics |

### API Examples

#### 1. Get All Links
```bash
curl -X GET http://localhost:3000/links
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "647abc123def456789",
      "title": "My Website",
      "url": "https://example.com",
      "description": "Check out my website",
      "isActive": true,
      "clickCount": 25,
      "order": 1
    }
  ]
}
```

#### 2. Track Link Click
```bash
curl -X POST http://localhost:3000/click/647abc123def456789 \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0..." \
  -H "Cookie: _fbp=fb.1.1234567890; _fbc=fb.1.1234567890"
```

Response:
```json
{
  "success": true,
  "redirectUrl": "https://example.com",
  "metaCapiSent": true,
  "data": {
    "linkId": "647abc123def456789",
    "title": "My Website",
    "url": "https://example.com",
    "clickCount": 26
  }
}
```

#### 3. Create New Link
```bash
curl -X POST http://localhost:3000/links \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Portfolio",
    "url": "https://portfolio.example.com",
    "description": "Check out my work",
    "order": 2
  }'
```

#### 4. Update Link
```bash
curl -X PATCH http://localhost:3000/links/647abc123def456789 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "title": "Updated Title"
  }'
```

#### 5. Get Analytics
```bash
curl -X GET http://localhost:3000/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalClicks": 150,
    "totalLinks": 5,
    "activeLinks": 4,
    "inactiveLinks": 1,
    "links": [...],
    "recentClicks": [...],
    "dailyClicks": [...]
  }
}
```

## 🎯 Meta Conversions API Integration

The `/click/:linkId` endpoint automatically sends comprehensive user data to Meta CAPI:

### Data Captured:
- ✅ IP address (`x-forwarded-for` header)
- ✅ User agent string
- ✅ Referrer URL
- ✅ Facebook browser ID (`_fbp` cookie)
- ✅ Facebook click ID (`_fbc` cookie)
- ✅ Timestamp and custom event data

### Event Schema:
```json
{
  "data": [{
    "event_name": "PageView",
    "event_time": 1234567890,
    "event_source_url": "https://referrer.com",
    "user_data": {
      "client_ip_address": "192.168.1.1",
      "client_user_agent": "Mozilla/5.0...",
      "fbp": "fb.1.1234567890",
      "fbc": "fb.1.1234567890"
    },
    "custom_data": {
      "link_id": "647abc123def456789",
      "event_type": "link_click",
      "source": "linktree_backend"
    }
  }]
}
```

## 📂 Project Structure

```
/linktree-backend
├── controllers/
│   └── linkController.js    # Business logic
├── models/
│   ├── Link.js             # Link data model
│   └── ClickEvent.js       # Click tracking model
├── routes/
│   ├── linkRoutes.js       # Link endpoints
│   └── healthRoutes.js     # Health check
├── services/
│   └── metaCapiService.js  # Meta CAPI integration
├── app.js                  # Main application
├── config.js              # Database configuration
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .env.example           # Environment template
└── README.md              # Documentation
```

## 🔧 Development

### Install Development Dependencies
```bash
npm install --save-dev nodemon
```

### Run in Development Mode
```bash
npm run dev
```

### MongoDB Setup (Local)
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/linktree
PIXEL_ID=your_actual_pixel_id
META_ACCESS_TOKEN=your_actual_token
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start app.js --name "linktree-backend"
pm2 startup
pm2 save
```

## 📊 Analytics Features

- **Real-time click tracking**
- **Daily click aggregation**
- **Link performance metrics**
- **Recent click history**
- **Meta CAPI delivery status**

## 🔒 Security Notes

- **No data hashing** (as requested for Meta CAPI)
- CORS enabled for frontend integration
- Request logging for debugging
- Error handling middleware
- Input validation on routes

## 📝 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Made with ❤️ for lightweight link tracking and Meta CAPI integration**
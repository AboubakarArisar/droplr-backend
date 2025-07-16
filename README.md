# Droplr Backend

A robust Node.js backend API for Droplr, a location-based file sharing application. This backend handles file uploads, location-based file discovery, and secure file management with automatic expiration.

## 🚀 Features

### Core Functionality

- **File Upload & Storage**: Secure file uploads to Cloudinary with automatic URL generation
- **Location-Based Discovery**: Find files within specified radius using GPS coordinates
- **Automatic File Expiry**: Files automatically deleted after 20 minutes
- **Real-Time Distance Calculation**: Accurate distance calculations using Haversine formula
- **Adaptive Search Radius**: Dynamic search area based on location accuracy

### Security & Performance

- **Secure File Handling**: Files stored securely in Cloudinary
- **Input Validation**: Comprehensive validation for location and file data
- **Error Handling**: Robust error handling and user-friendly messages
- **Database Optimization**: Efficient MongoDB queries with indexing
- **CORS Support**: Cross-origin resource sharing enabled

### Location Intelligence

- **GPS Coordinate Validation**: Ensures valid latitude/longitude values
- **Dynamic Bounding Box**: Latitude-adjusted search areas for accuracy
- **Distance-Based Filtering**: Precise distance calculations for file discovery
- **Accuracy-Based Adaptation**: Adjusts search radius based on user location accuracy

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.14.1
- **File Storage**: Cloudinary with multer-storage-cloudinary
- **File Upload**: Multer 1.4.5-lts.2
- **CORS**: Cross-origin resource sharing
- **Environment**: dotenv for configuration management

## 📁 Project Structure

```
droplr-backend/
├── config/                 # Configuration files
│   ├── db.js              # MongoDB connection
│   └── cloudinary.config.js # Cloudinary configuration
├── controller/            # Request handlers
│   └── file.controller.js # File upload and retrieval logic
├── middlewares/           # Custom middleware
│   ├── location.middleware.js # Location validation
│   └── upload.middleware.js   # File upload handling
├── models/                # Database models
│   └── file.model.js      # File schema definition
├── routes/                # API routes
│   └── file.routes.js     # File-related endpoints
├── services/              # Business logic
│   └── file.service.js    # File operations and distance calculations
├── public/                # Static files
├── uploads/               # Temporary upload directory
├── index.js               # Application entry point
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd droplr-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   MONGO_URL=mongodb://localhost:27017/droplr
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Verify the server is running**
   Navigate to `http://localhost:3000` - you should see:
   ```json
   {
     "message": "Hello, from the backend of droplr!"
   }
   ```

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api/files
```

### 1. Upload File (with optional password and visibility)

**POST** `/upload`

Upload a file with location data, optional password protection, and visibility (public/private).

**Request:**

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: File to upload (max 100MB)
  - `latitude`: GPS latitude (number)
  - `longitude`: GPS longitude (number)
  - `password`: (optional) Password to protect the file (only for private files)
  - `visibility`: (optional) 'public' or 'private' (default: 'public')

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "file_id",
    "filename": "example.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "publicId": "uploads/...",
    "latitude": 40.7128,
    "longitude": -74.006,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "passwordHash": "...", // Only present if password was set
    "visibility": "public" // or "private"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "File is required"
}
```

### 2. Download File (with password verification for private files)

**POST** `/download/:id`

Download or access a file by its ID. If the file is private and password-protected, you must provide the correct password. Public files are accessible without a password.

**Request:**

- **Content-Type**: `application/json`
- **Body**:
  - `password`: (required if file is private and password-protected) Password for the file

**Response:**

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://res.cloudinary.com/...",
    "filename": "example.pdf"
  }
}
```

**Error Responses:**

- File not found:

```json
{
  "success": false,
  "message": "File not found"
}
```

- Password required (for private files):

```json
{
  "success": false,
  "message": "Password required"
}
```

- Incorrect password:

```json
{
  "success": false,
  "message": "Incorrect password"
}
```

### 2. Get Nearby Files

**GET** `/nearby`

Retrieve files within specified radius.

**Query Parameters:**

- `latitude`: GPS latitude (required)
- `longitude`: GPS longitude (required)
- `accuracy`: Location accuracy in meters (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "file_id",
      "filename": "example.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "publicId": "uploads/...",
      "latitude": 40.7128,
      "longitude": -74.006,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "distance": 150
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

| Variable                | Description               | Required | Default |
| ----------------------- | ------------------------- | -------- | ------- |
| `PORT`                  | Server port               | Yes      | 3000    |
| `MONGO_URL`             | MongoDB connection string | Yes      | -       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | Yes      | -       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | Yes      | -       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | Yes      | -       |

### Application Settings

- **File Expiry**: 20 minutes (1200 seconds)
- **Default Search Radius**: 200 meters
- **Maximum File Size**: 100MB (Cloudinary limit)
- **GPS Accuracy Threshold**: 50 meters for optimal results

## 🗄️ Database Schema

### File Model

```javascript
{
  filename: String,        // Original filename
  fileUrl: String,         // Cloudinary secure URL
  publicId: String,        // Cloudinary public ID
  latitude: Number,        // GPS latitude
  longitude: Number,       // GPS longitude
  createdAt: Date          // Auto-expires after 20 minutes
}
```

**Indexes:**

- `createdAt`: TTL index for automatic deletion
- `latitude, longitude`: Compound index for location queries

## 📊 Location & Distance Calculations

### Haversine Distance Formula

```javascript
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};
```

### Dynamic Bounding Box

```javascript
const calculateBoundingBox = (latitude, longitude, radiusMeters = 200) => {
  const latDelta = radiusMeters / 111320;
  const lonDelta =
    radiusMeters / (111320 * Math.cos((latitude * Math.PI) / 180));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
};
```

## 🔒 Security Features

### File Security

- **Secure URLs**: Cloudinary secure URLs prevent unauthorized access
- **Automatic Deletion**: Files deleted after 20 minutes
- **No Local Storage**: Files not stored on server
- **Input Validation**: Comprehensive validation for all inputs

### Location Security

- **Coordinate Validation**: Ensures valid GPS coordinates
- **Range Checking**: Validates latitude/longitude ranges
- **Type Safety**: Converts and validates numeric values

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **Cloudinary**: Configure production Cloudinary account
4. **Process Manager**: Use PM2 or similar for process management

### PM2 Configuration

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name "droplr-backend"

# Monitor
pm2 monit

# Logs
pm2 logs droplr-backend
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] File upload with valid location data
- [ ] File upload with invalid location data
- [ ] Nearby files retrieval with different coordinates
- [ ] File expiry after 20 minutes
- [ ] Error handling for missing files
- [ ] CORS functionality
- [ ] Large file uploads (up to 100MB)
- [ ] Invalid file types
- [ ] Network error handling

### API Testing with cURL

```bash
# Upload file
curl -X POST http://localhost:5000/api/files/upload \
  -F "file=@example.pdf" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060"

# Get nearby files
curl "http://localhost:5000/api/files/nearby?latitude=40.7128&longitude=-74.0060"
```

## 📈 Performance

### Optimizations

- **Database Indexing**: Compound indexes on location fields
- **TTL Indexes**: Automatic document deletion
- **Efficient Queries**: Bounding box queries for location searches
- **Streaming Uploads**: Multer handles large files efficiently
- **Cloudinary CDN**: Global content delivery network

### Monitoring

- **Database Performance**: Monitor MongoDB query performance
- **File Upload Speed**: Track upload times and success rates
- **API Response Times**: Monitor endpoint response times
- **Error Rates**: Track and analyze error patterns

## 🔧 Development

### Scripts

```bash
# Development with auto-restart
npm run dev

# Production start
npm start

# Install dependencies
npm install
```

### Code Style

- **ESLint**: Configure for Node.js/Express
- **Error Handling**: Consistent error response format
- **Middleware**: Modular middleware architecture
- **Service Layer**: Business logic separated from controllers

### Key Dependencies

- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **Multer**: File upload handling
- **Cloudinary**: Cloud file storage
- **CORS**: Cross-origin support

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Check `MONGO_URL` environment variable
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Cloudinary Upload Failed**

   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper file format

3. **Location Validation Errors**

   - Ensure latitude/longitude are valid numbers
   - Check coordinate ranges (-90 to 90 for lat, -180 to 180 for lon)

4. **CORS Issues**
   - Verify CORS configuration
   - Check frontend origin settings

### Logs

```bash
# View application logs
npm run dev



# Cloudinary logs (via dashboard)
# Check Cloudinary dashboard for upload logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Droplr Backend** - Powering secure, location-based file sharing.

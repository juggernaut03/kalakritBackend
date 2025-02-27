// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const walletRoutes = require('./routes/wallet');
const notificationRoutes = require('./routes/notifications');
const categoryRoutes = require('./routes/categories');

// Load environment variables
dotenv.config();

// Verify environment variables at startup
const verifyEnvironment = () => {
  const requiredVars = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }

  console.log('Environment variables verified');
};

// Create Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Database setup completed');
    verifyEnvironment();
    initializeServer();
  })
  .catch(error => {
    console.error('Failed to setup database:', error);
    process.exit(1);
  });

function initializeServer() {
  // Security Middleware
  app.use(helmet());
  
  // Configure CORS
  const corsOptions = {
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:19006',      // Expo web development server
      'exp://localhost:19000',       // Expo Go development client
      'http://localhost:19000',      // Alternative Expo local URL
      'exp://192.168.116.1:19000',   // Local IP
      'http://192.168.1.102:19000',  // Local IP HTTP
      'http://192.168.1.102:3000'    // Local IP Backend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  app.use(cors(corsOptions));

  // Request Parsing Middleware with increased limit for images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Logging Middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Static Files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/categories', categoryRoutes);

  // Health Check Route
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date(),
      env: process.env.NODE_ENV,
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME
    });
  });

  // Test route for environment variables
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/config-test', (req, res) => {
      res.json({
        cloudinaryConfigured: {
          cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !!process.env.CLOUDINARY_API_KEY,
          apiSecret: !!process.env.CLOUDINARY_API_SECRET
        },
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: corsOptions.origin
      });
    });
  }

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ 
      message: 'Route not found',
      path: req.path
    });
  });

  // Global Error Handler
  app.use((error, req, res, next) => {
    console.error('Global error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    if (process.env.NODE_ENV === 'development') {
      res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack: error.stack,
      });
    } else {
      res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
      });
    }
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log('CORS enabled for origins:', corsOptions.origin);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  app.use(cors({
    origin: [
        'http://localhost:19006',      // Expo web development server
        'exp://localhost:19000',       // Expo Go development client
        'http://localhost:19000',      // Alternative Expo local URL
        'exp://192.168.1.102:19000',    // Replace with your local IP
          
    ],
    credentials: true
}));
}

module.exports = app;
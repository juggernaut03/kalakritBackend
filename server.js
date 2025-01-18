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

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Database setup completed');
    initializeServer();
  })
  .catch(error => {
    console.error('Failed to setup database:', error);
    process.exit(1);
  });

function initializeServer() {
  // Security Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  // Request Parsing Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging Middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Static Files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Health Check Route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
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
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    process.exit(1);
  });

  app.use(cors({
    origin: [
        'http://localhost:19006',      // Expo web development server
        'exp://localhost:19000',       // Expo Go development client
        'http://localhost:19000',      // Alternative Expo local URL
        'exp://192.168.0.106:19000',    // Replace with your local IP
          
    ],
    credentials: true
}));
}

module.exports = app; // For testing purposes
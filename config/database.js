// config/database.js
const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

const initializeDatabase = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes('users')) {
      console.log('Creating users collection...');
      await mongoose.connection.db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password", "role"],
            properties: {
              name: {
                bsonType: "string",
                description: "Name must be a string and is required"
              },
              email: {
                bsonType: "string",
                description: "Email must be a string and is required"
              },
              password: {
                bsonType: "string",
                description: "Password must be a string and is required"
              },
              role: {
                enum: ["artisan", "buyer"],
                description: "Role must be either artisan or buyer"
              }
            }
          }
        }
      });
    }
    if (!collectionNames.includes('products')) {
      console.log('Creating products collection...');
      await mongoose.connection.db.createCollection('products', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "price", "artisan", "category"],
            properties: {
              name: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              price: {
                bsonType: "number",
                minimum: 0,
                description: "must be a positive number and is required"
              },
              stock: {
                bsonType: "number",
                minimum: 0,
                description: "must be a positive number"
              }
            }
          }
        }
      });
    }

    if (!collectionNames.includes('orders')) {
      console.log('Creating orders collection...');
      await mongoose.connection.db.createCollection('orders', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["orderNumber", "buyer", "products", "totalAmount"],
            properties: {
              orderNumber: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              totalAmount: {
                bsonType: "number",
                minimum: 0,
                description: "must be a positive number and is required"
              }
            }
          }
        }
      });
    }

    if (!collectionNames.includes('notifications')) {
      console.log('Creating notifications collection...');
      await mongoose.connection.db.createCollection('notifications', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["user", "type", "message"],
            properties: {
              type: {
                enum: ["order", "payment", "update", "promotion", "system"],
                description: "must be one of the defined types and is required"
              },
              read: {
                bsonType: "bool",
                description: "must be a boolean"
              }
            }
          }
        }
      });
    }

    // Create indexes
    console.log('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ "wallet.balance": 1 });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ createdAt: 1 });

    // Product indexes
    await Product.collection.createIndex({ name: "text", description: "text" }); // Text search
    await Product.collection.createIndex({ artisan: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ "ratings.average": 1 });
    await Product.collection.createIndex({ status: 1 });
    await Product.collection.createIndex({ tags: 1 });

    // Order indexes
    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    await Order.collection.createIndex({ buyer: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ "payment.status": 1 });
    await Order.collection.createIndex({ createdAt: 1 });

    // Notification indexes
    await Notification.collection.createIndex({ user: 1 });
    await Notification.collection.createIndex({ type: 1 });
    await Notification.collection.createIndex({ read: 1 });
    await Notification.collection.createIndex({ createdAt: 1 });

    // Compound indexes
    await Product.collection.createIndex({ category: 1, status: 1 });
    await Order.collection.createIndex({ buyer: 1, status: 1 });
    await Notification.collection.createIndex({ user: 1, read: 1 });

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'kalakriti'
    });
    console.log('MongoDB connected successfully');
    
    // Initialize database structure
    await initializeDatabase();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
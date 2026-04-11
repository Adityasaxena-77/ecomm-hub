const mongoose = require('mongoose');

// MongoDB connection utility
class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect(uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomm-hub') {
    try {
      if (this.isConnected) {
        console.log('MongoDB already connected');
        return this.connection;
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
      };

      this.connection = await mongoose.connect(uri, options);

      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('✅ MongoDB disconnected successfully');
      }
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
      throw error;
    }
  }

  async ping() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const result = await mongoose.connection.db.admin().ping();
      return result;
    } catch (error) {
      console.error('❌ MongoDB ping failed:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const stats = await mongoose.connection.db.stats();
      return stats;
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const User = require('../models/User');
      const Product = require('../models/Product');
      const Order = require('../models/Order');

      // User indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ "address.city": 1 });
      await User.collection.createIndex({ createdAt: -1 });

      // Product indexes
      await Product.collection.createIndex({ name: "text", description: "text" });
      await Product.collection.createIndex({ category: 1, isActive: 1 });
      await Product.collection.createIndex({ price: 1 });
      await Product.collection.createIndex({ rating: -1 });
      await Product.collection.createIndex({ createdAt: -1 });
      await Product.collection.createIndex({ seller: 1 });

      // Order indexes
      await Order.collection.createIndex({ user: 1, createdAt: -1 });
      await Order.collection.createIndex({ orderStatus: 1 });
      await Order.collection.createIndex({ isPaid: 1 });
      await Order.collection.createIndex({ isDelivered: 1 });
      await Order.collection.createIndex({ createdAt: -1 });

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
      throw error;
    }
  }

  async dropIndexes() {
    try {
      const collections = ['users', 'products', 'orders'];

      for (const collectionName of collections) {
        const collection = mongoose.connection.db.collection(collectionName);
        await collection.dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      }
    } catch (error) {
      console.error('❌ Failed to drop indexes:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Database clearing is only allowed in development mode');
      }

      const collections = mongoose.connection.db.listCollections();
      const collectionsArray = await collections.toArray();

      for (const collection of collectionsArray) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`✅ Cleared collection: ${collection.name}`);
      }

      console.log('✅ Database cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear database:', error);
      throw error;
    }
  }
}

module.exports = new Database();
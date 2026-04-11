const { MongoClient } = require('mongodb');

/**
 * MongoDB Database Cleanup Script
 * Removes old data, orphaned records, and optimizes collections
 */

class DatabaseCleaner {
  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      console.log('Connected to MongoDB');
      return this.client.db(this.dbName);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  async cleanExpiredSessions() {
    try {
      const db = await this.connect();
      const sessions = db.collection('sessions');

      // Remove sessions older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await sessions.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Removed ${result.deletedCount} expired sessions`);
      return result.deletedCount;
    } catch (error) {
      console.error('Clean expired sessions failed:', error);
      throw error;
    }
  }

  async cleanOrphanedReviews() {
    try {
      const db = await this.connect();
      const reviews = db.collection('reviews');
      const products = db.collection('products');

      // Find reviews for non-existent products
      const productIds = await products.distinct('_id');
      const result = await reviews.deleteMany({
        productId: { $nin: productIds }
      });

      console.log(`Removed ${result.deletedCount} orphaned reviews`);
      return result.deletedCount;
    } catch (error) {
      console.error('Clean orphaned reviews failed:', error);
      throw error;
    }
  }

  async cleanOrphanedOrders() {
    try {
      const db = await this.connect();
      const orders = db.collection('orders');
      const users = db.collection('users');

      // Find orders for non-existent users
      const userIds = await users.distinct('_id');
      const result = await orders.deleteMany({
        userId: { $nin: userIds }
      });

      console.log(`Removed ${result.deletedCount} orphaned orders`);
      return result.deletedCount;
    } catch (error) {
      console.error('Clean orphaned orders failed:', error);
      throw error;
    }
  }

  async cleanOldLogs(days = 90) {
    try {
      const db = await this.connect();
      const logs = db.collection('logs');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await logs.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      console.log(`Removed ${result.deletedCount} old log entries`);
      return result.deletedCount;
    } catch (error) {
      console.error('Clean old logs failed:', error);
      throw error;
    }
  }

  async optimizeCollections() {
    try {
      const db = await this.connect();
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        const coll = db.collection(collection.name);
        await coll.createIndex({ createdAt: 1 });
        await coll.createIndex({ updatedAt: 1 });
        console.log(`Optimized indexes for ${collection.name}`);
      }

      console.log('All collections optimized');
    } catch (error) {
      console.error('Optimize collections failed:', error);
      throw error;
    }
  }

  async runFullCleanup() {
    try {
      console.log('Starting database cleanup...');

      const results = {
        expiredSessions: await this.cleanExpiredSessions(),
        orphanedReviews: await this.cleanOrphanedReviews(),
        orphanedOrders: await this.cleanOrphanedOrders(),
        oldLogs: await this.cleanOldLogs(),
      };

      await this.optimizeCollections();

      console.log('Database cleanup completed');
      console.log('Cleanup summary:', results);

      return results;
    } catch (error) {
      console.error('Full cleanup failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('Connection closed');
    }
  }
}

// Usage example
async function main() {
  const cleaner = new DatabaseCleaner(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    'ecommerce'
  );

  try {
    await cleaner.runFullCleanup();
  } catch (error) {
    console.error('Cleanup operation failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseCleaner;
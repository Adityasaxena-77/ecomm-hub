const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

/**
 * MongoDB Database Initialization Script
 * Sets up database with indexes, validation rules, and initial configuration
 */

class DatabaseInitializer {
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

  async createIndexes() {
    try {
      const db = await this.connect();

      console.log('Creating database indexes...');

      // Users collection indexes
      const users = db.collection('users');
      await users.createIndex({ email: 1 }, { unique: true });
      await users.createIndex({ username: 1 }, { unique: true });
      await users.createIndex({ createdAt: 1 });
      await users.createIndex({ role: 1 });
      console.log('✓ Users indexes created');

      // Products collection indexes
      const products = db.collection('products');
      await products.createIndex({ name: 'text', description: 'text' });
      await products.createIndex({ category: 1 });
      await products.createIndex({ price: 1 });
      await products.createIndex({ stock: 1 });
      await products.createIndex({ createdAt: 1 });
      await products.createIndex({ sellerId: 1 });
      console.log('✓ Products indexes created');

      // Orders collection indexes
      const orders = db.collection('orders');
      await orders.createIndex({ userId: 1 });
      await orders.createIndex({ status: 1 });
      await orders.createIndex({ createdAt: 1 });
      await orders.createIndex({ 'items.productId': 1 });
      await orders.createIndex({ totalAmount: 1 });
      console.log('✓ Orders indexes created');

      // Reviews collection indexes
      const reviews = db.collection('reviews');
      await reviews.createIndex({ productId: 1 });
      await reviews.createIndex({ userId: 1 });
      await reviews.createIndex({ rating: 1 });
      await reviews.createIndex({ createdAt: 1 });
      await reviews.createIndex({ productId: 1, userId: 1 }, { unique: true });
      console.log('✓ Reviews indexes created');

      // Cart collection indexes
      const carts = db.collection('carts');
      await carts.createIndex({ userId: 1 }, { unique: true });
      await carts.createIndex({ 'items.productId': 1 });
      console.log('✓ Carts indexes created');

      // Sessions collection indexes
      const sessions = db.collection('sessions');
      await sessions.createIndex({ userId: 1 });
      await sessions.createIndex({ token: 1 }, { unique: true });
      await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      console.log('✓ Sessions indexes created');

      console.log('All indexes created successfully');
    } catch (error) {
      console.error('Create indexes failed:', error);
      throw error;
    }
  }

  async createValidationRules() {
    try {
      const db = await this.connect();

      console.log('Creating collection validation rules...');

      // Users validation
      await db.command({
        collMod: 'users',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'password', 'name'],
            properties: {
              email: { bsonType: 'string', pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
              password: { bsonType: 'string', minLength: 6 },
              name: { bsonType: 'string', minLength: 2 },
              role: { enum: ['user', 'admin', 'seller'] },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
      console.log('✓ Users validation rules created');

      // Products validation
      await db.command({
        collMod: 'products',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'price', 'category'],
            properties: {
              name: { bsonType: 'string', minLength: 1 },
              price: { bsonType: 'number', minimum: 0 },
              category: { bsonType: 'string' },
              stock: { bsonType: 'int', minimum: 0 },
              images: { bsonType: 'array' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
      console.log('✓ Products validation rules created');

      // Orders validation
      await db.command({
        collMod: 'orders',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'items', 'totalAmount'],
            properties: {
              userId: { bsonType: 'objectId' },
              items: { bsonType: 'array', minItems: 1 },
              totalAmount: { bsonType: 'number', minimum: 0 },
              status: { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
      console.log('✓ Orders validation rules created');

      console.log('All validation rules created successfully');
    } catch (error) {
      console.error('Create validation rules failed:', error);
      throw error;
    }
  }

  async createCollections() {
    try {
      const db = await this.connect();

      console.log('Creating collections...');

      const collections = [
        'users', 'products', 'orders', 'reviews', 'carts',
        'sessions', 'logs', 'categories', 'coupons'
      ];

      for (const collectionName of collections) {
        await db.createCollection(collectionName);
        console.log(`✓ Created collection: ${collectionName}`);
      }

      console.log('All collections created successfully');
    } catch (error) {
      console.error('Create collections failed:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      console.log('Starting database initialization...\n');

      await this.createCollections();
      await this.createIndexes();
      await this.createValidationRules();

      console.log('\nDatabase initialization completed successfully!');
    } catch (error) {
      console.error('Database initialization failed:', error);
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
  const initializer = new DatabaseInitializer(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    'ecommerce'
  );

  try {
    await initializer.initializeDatabase();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseInitializer;
const mongoose = require('mongoose');
const database = require('../database');
require('dotenv').config();

// Migration: Add wishlist and cart fields to users
async function migrateUsers() {
  try {
    console.log('🔄 Starting user migration...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Add wishlist field if not exists
    await usersCollection.updateMany(
      { wishlist: { $exists: false } },
      { $set: { wishlist: [] } }
    );

    // Add cart field if not exists
    await usersCollection.updateMany(
      { cart: { $exists: false } },
      { $set: { cart: [] } }
    );

    // Add timestamps if not exists
    await usersCollection.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date(), updatedAt: new Date() } }
    );

    console.log('✅ User migration completed');
  } catch (error) {
    console.error('❌ User migration failed:', error);
    throw error;
  }
}

// Migration: Add review fields to products
async function migrateProducts() {
  try {
    console.log('🔄 Starting product migration...');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Add reviews array if not exists
    await productsCollection.updateMany(
      { reviews: { $exists: false } },
      { $set: { reviews: [], numReviews: 0, rating: 0 } }
    );

    // Add timestamps if not exists
    await productsCollection.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date(), updatedAt: new Date() } }
    );

    // Add salesCount and viewCount if not exists
    await productsCollection.updateMany(
      { salesCount: { $exists: false } },
      { $set: { salesCount: 0, viewCount: 0 } }
    );

    console.log('✅ Product migration completed');
  } catch (error) {
    console.error('❌ Product migration failed:', error);
    throw error;
  }
}

// Migration: Add tracking history to orders
async function migrateOrders() {
  try {
    console.log('🔄 Starting order migration...');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Add trackingHistory array if not exists
    const orders = await ordersCollection.find({
      trackingHistory: { $exists: false }
    }).toArray();

    for (const order of orders) {
      const trackingHistory = [{
        status: order.orderStatus || 'placed',
        timestamp: order.createdAt || new Date(),
        description: getStatusDescription(order.orderStatus || 'placed')
      }];

      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { trackingHistory } }
      );
    }

    // Add timestamps if not exists
    await ordersCollection.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date(), updatedAt: new Date() } }
    );

    console.log('✅ Order migration completed');
  } catch (error) {
    console.error('❌ Order migration failed:', error);
    throw error;
  }
}

function getStatusDescription(status) {
  const descriptions = {
    placed: 'Order has been placed successfully',
    confirmed: 'Order has been confirmed',
    packed: 'Order has been packed and ready for shipping',
    shipped: 'Order has been shipped',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order has been delivered successfully',
    cancelled: 'Order has been cancelled'
  };
  return descriptions[status] || 'Status updated';
}

// Main migration runner
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    await database.connect();

    await migrateUsers();
    await migrateProducts();
    await migrateOrders();

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// Rollback migrations (if needed)
async function rollbackMigrations() {
  try {
    console.log('🔄 Starting migration rollback...');

    await database.connect();
    const db = mongoose.connection.db;

    // Remove added fields (be careful with this!)
    console.log('⚠️  Rollback functionality not implemented for safety');

    console.log('✅ Rollback completed');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'rollback':
      rollbackMigrations();
      break;
    default:
      runMigrations();
      break;
  }
}

module.exports = {
  runMigrations,
  rollbackMigrations,
  migrateUsers,
  migrateProducts,
  migrateOrders
};
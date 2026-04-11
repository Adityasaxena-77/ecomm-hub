const mongoose = require('mongoose');
const database = require('../database');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@ecommhub.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    phone: '+91-9876543210',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    phone: '+91-9876543211',
    address: {
      street: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  },
  {
    name: 'Raj Kumar',
    email: 'raj@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    phone: '+91-9876543212',
    address: {
      street: '789 Pine Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  }
];

const seedProducts = [
  {
    name: 'Wireless Bluetooth Headphones Pro',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    category: 'electronics',
    brand: 'AudioTech',
    stock: 50,
    images: [
      { public_id: 'headphones_1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
      { public_id: 'headphones_2', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop' }
    ],
    rating: 4.3,
    numReviews: 12453,
    features: ['Active Noise Cancellation', '30hr Battery', 'Bluetooth 5.0', 'Quick Charge'],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Impedance': '32Ω',
      'Weight': '250g'
    },
    tags: ['wireless', 'bluetooth', 'noise-cancelling', 'premium'],
    isActive: true,
    isFeatured: true,
    weight: 0.3,
    dimensions: { length: 20, width: 18, height: 8 },
    warranty: '1 year'
  },
  {
    name: 'Smart Watch Ultra Series 5',
    description: 'Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Track your fitness goals with precision.',
    price: 3499,
    originalPrice: 7999,
    discount: 56,
    category: 'electronics',
    brand: 'TechFit',
    stock: 30,
    images: [
      { public_id: 'smartwatch_1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop' },
      { public_id: 'smartwatch_2', url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&h=300&fit=crop' }
    ],
    rating: 4.5,
    numReviews: 8921,
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', '7-Day Battery'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery Life': '7 days',
      'Water Resistance': '50m',
      'Sensors': 'Heart Rate, SpO2, Accelerometer'
    },
    tags: ['smartwatch', 'fitness', 'health', 'gps'],
    isActive: true,
    isFeatured: true,
    weight: 0.05,
    dimensions: { length: 4.5, width: 4.5, height: 1.2 },
    warranty: '2 years'
  },
  {
    name: 'Premium Cotton T-Shirt Pack of 3',
    description: 'Comfortable and stylish cotton t-shirts in assorted colors. Made from 100% organic cotton with perfect fit and durability.',
    price: 599,
    originalPrice: 1499,
    discount: 60,
    category: 'fashion',
    brand: 'ComfortWear',
    stock: 100,
    images: [
      { public_id: 'tshirt_1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop' },
      { public_id: 'tshirt_2', url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop' }
    ],
    rating: 4.1,
    numReviews: 34521,
    features: ['100% Organic Cotton', 'Assorted Colors', 'Comfortable Fit', 'Machine Washable'],
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Regular',
      'Sizes': 'S, M, L, XL',
      'Care': 'Machine Wash'
    },
    tags: ['cotton', 't-shirt', 'comfortable', 'organic'],
    isActive: true,
    weight: 0.5,
    dimensions: { length: 30, width: 25, height: 2 },
    warranty: 'none'
  },
  {
    name: 'Running Shoes Air Max',
    description: 'Professional running shoes with advanced cushioning technology and breathable mesh upper. Designed for athletes and fitness enthusiasts.',
    price: 2799,
    originalPrice: 5999,
    discount: 53,
    category: 'sports',
    brand: 'SportPro',
    stock: 75,
    images: [
      { public_id: 'shoes_1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
      { public_id: 'shoes_2', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop' }
    ],
    rating: 4.4,
    numReviews: 19876,
    features: ['Air Cushioning', 'Breathable Mesh', 'Lightweight', 'Durable Sole'],
    specifications: {
      'Material': 'Mesh/Synthetic',
      'Sole': 'Rubber',
      'Weight': '280g',
      'Sizes': '6-12'
    },
    tags: ['running', 'sports', 'comfortable', 'durable'],
    isActive: true,
    isFeatured: true,
    weight: 0.35,
    dimensions: { length: 32, width: 22, height: 12 },
    warranty: '1 year'
  },
  {
    name: 'Stainless Steel Water Bottle 1L',
    description: 'Eco-friendly stainless steel water bottle with double-wall insulation. Keeps drinks cold for 24 hours and hot for 12 hours.',
    price: 449,
    originalPrice: 999,
    discount: 55,
    category: 'home',
    brand: 'EcoBottle',
    stock: 200,
    images: [
      { public_id: 'bottle_1', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop' },
      { public_id: 'bottle_2', url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&h=300&fit=crop' }
    ],
    rating: 4.6,
    numReviews: 45231,
    features: ['Double Wall Insulation', 'BPA Free', 'Leak Proof', 'Eco-Friendly'],
    specifications: {
      'Material': 'Stainless Steel',
      'Capacity': '1L',
      'Insulation': '24h Cold / 12h Hot',
      'Weight': '350g'
    },
    tags: ['water-bottle', 'stainless-steel', 'insulated', 'eco-friendly'],
    isActive: true,
    weight: 0.35,
    dimensions: { length: 8, width: 8, height: 28 },
    warranty: '6 months'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ User seeding failed:', error);
    throw error;
  }
}

async function seedProducts() {
  try {
    console.log('🌱 Seeding products...');

    // Get admin user as seller
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please seed users first.');
    }

    for (const productData of seedProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        await Product.create({ ...productData, seller: adminUser._id });
        console.log(`✅ Created product: ${productData.name}`);
      } else {
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Product seeding failed:', error);
    throw error;
  }
}

async function seedOrders() {
  try {
    console.log('🌱 Seeding orders...');

    // Get users and products
    const users = await User.find({ role: 'user' }).limit(2);
    const products = await Product.find().limit(3);

    if (users.length === 0 || products.length === 0) {
      console.log('⚠️  Not enough users or products to create orders');
      return;
    }

    const sampleOrders = [
      {
        user: users[0]._id,
        orderItems: [
          {
            product: products[0]._id,
            name: products[0].name,
            image: products[0].images[0].url,
            price: products[0].price,
            quantity: 1
          }
        ],
        shippingAddress: users[0].address,
        paymentMethod: 'card',
        orderStatus: 'delivered',
        isPaid: true,
        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        user: users[1]._id,
        orderItems: [
          {
            product: products[1]._id,
            name: products[1].name,
            image: products[1].images[0].url,
            price: products[1].price,
            quantity: 1
          },
          {
            product: products[2]._id,
            name: products[2].name,
            image: products[2].images[0].url,
            price: products[2].price,
            quantity: 2
          }
        ],
        shippingAddress: users[1].address,
        paymentMethod: 'upi',
        orderStatus: 'shipped',
        isPaid: true,
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    for (const orderData of sampleOrders) {
      await Order.create(orderData);
      console.log(`✅ Created order for user: ${users.find(u => u._id.equals(orderData.user)).email}`);
    }

    console.log('✅ Orders seeded successfully');
  } catch (error) {
    console.error('❌ Order seeding failed:', error);
    throw error;
  }
}

async function runSeeds() {
  try {
    console.log('🚀 Starting database seeding...');

    await database.connect();

    await seedUsers();
    await seedProducts();
    await seedOrders();

    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

async function clearSeeds() {
  try {
    console.log('🧹 Clearing seeded data...');

    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Data clearing is only allowed in development mode');
    }

    await database.connect();

    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@ecommhub.com' } }); // Keep admin

    console.log('✅ Seeded data cleared successfully');

  } catch (error) {
    console.error('❌ Clearing failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'clear':
      clearSeeds();
      break;
    default:
      runSeeds();
      break;
  }
}

module.exports = {
  runSeeds,
  clearSeeds,
  seedUsers,
  seedProducts,
  seedOrders
};
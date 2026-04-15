import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  selectedAttributes: [{
    name: String,
    value: String
  }],
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,

  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
    required: true
  },
  paymentId: String,
  transactionId: String,

  // Shipping
  shippingMethod: {
    type: String,
    default: 'standard'
  },
  trackingNumber: String,
  estimatedDelivery: Date,

  // Coupon
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },

  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,

  // Notes
  customerNotes: String,
  adminNotes: String,

  // Metadata
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  this.status = newStatus;

  // Update timestamps based on status
  switch (newStatus) {
    case 'shipped':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }

  if (notes) {
    this.adminNotes = notes;
  }

  await this.save();
  return this;
};

// Instance method to calculate refund amount
orderSchema.methods.calculateRefund = function() {
  if (this.paymentStatus !== 'paid') {
    return 0;
  }

  // Full refund if cancelled before shipping
  if (this.status === 'cancelled' && !this.shippedAt) {
    return this.total;
  }

  // Partial refund if cancelled after shipping (minus shipping cost)
  if (this.status === 'cancelled' && this.shippedAt) {
    return this.total - this.shipping;
  }

  return 0;
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, page = 1, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('items.product', 'name images');
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, page = 1, limit = 20) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email')
    .populate('items.product', 'name images');
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'paid'] },
              '$total',
              0
            ]
          }
        },
        pendingOrders: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'pending'] },
              1,
              0
            ]
          }
        },
        completedOrders: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'delivered'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
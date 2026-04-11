const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for order']
  },
  orderItems: [{
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
    }
  }],
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['card', 'paypal', 'upi', 'cod', 'netbanking'],
      message: 'Please select a valid payment method'
    }
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Tax price cannot be negative']
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Shipping price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: Date,
  orderStatus: {
    type: String,
    required: true,
    enum: {
      values: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      message: 'Please select a valid order status'
    },
    default: 'placed'
  },
  trackingNumber: {
    type: String,
    sparse: true
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    location: String
  }],
  cancellationReason: {
    type: String,
    enum: ['customer_request', 'payment_failed', 'out_of_stock', 'other']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processing', 'completed', 'rejected'],
    default: 'none'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware to update tracking history
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    const statusDescriptions = {
      placed: 'Order has been placed successfully',
      confirmed: 'Order has been confirmed',
      packed: 'Order has been packed and ready for shipping',
      shipped: 'Order has been shipped',
      out_for_delivery: 'Order is out for delivery',
      delivered: 'Order has been delivered successfully',
      cancelled: 'Order has been cancelled'
    };

    this.trackingHistory.push({
      status: this.orderStatus,
      description: statusDescriptions[this.orderStatus] || 'Status updated',
      timestamp: new Date()
    });
  }
  next();
});

// Instance method to calculate total
orderSchema.methods.calculateTotal = function() {
  this.totalPrice = this.orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0) + this.taxPrice + this.shippingPrice;
  return this.totalPrice;
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, limit = 50) {
  return this.find({ orderStatus: status })
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Order', orderSchema);
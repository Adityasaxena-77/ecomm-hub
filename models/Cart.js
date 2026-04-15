import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  selectedAttributes: [{
    name: String,
    value: String
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
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
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', async function(next) {
  try {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Apply coupon discount
    let discountAmount = 0;
    if (this.coupon && this.coupon.code) {
      if (this.coupon.type === 'percentage') {
        discountAmount = (this.subtotal * this.coupon.discount) / 100;
      } else {
        discountAmount = Math.min(this.coupon.discount, this.subtotal);
      }
    }
    this.discount = discountAmount;

    // Calculate total
    this.total = this.subtotal + this.tax + this.shipping - this.discount;

    // Ensure total is not negative
    this.total = Math.max(0, this.total);

    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to add item
cartSchema.methods.addItem = function(productId, quantity, price, attributes = []) {
  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedAttributes.sort()) === JSON.stringify(attributes.sort())
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.addedAt = new Date();
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedAttributes: attributes,
      addedAt: new Date()
    });
  }
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, attributes = []) {
  const item = this.items.find(item =>
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedAttributes.sort()) === JSON.stringify(attributes.sort())
  );

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(i => i !== item);
    } else {
      item.quantity = Math.min(quantity, 99);
    }
  }
};

// Instance method to remove item
cartSchema.methods.removeItem = function(productId, attributes = []) {
  this.items = this.items.filter(item =>
    !(item.product.toString() === productId.toString() &&
      JSON.stringify(item.selectedAttributes.sort()) === JSON.stringify(attributes.sort()))
  );
};

// Instance method to clear cart
cartSchema.methods.clear = function() {
  this.items = [];
  this.subtotal = 0;
  this.total = 0;
  this.discount = 0;
  this.coupon = undefined;
};

// Instance method to apply coupon
cartSchema.methods.applyCoupon = function(code, discount, type = 'percentage') {
  this.coupon = {
    code,
    discount,
    type
  };
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.coupon = undefined;
  this.discount = 0;
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId });

  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  }

  return cart;
};

// Static method to clean expired carts
cartSchema.statics.cleanExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
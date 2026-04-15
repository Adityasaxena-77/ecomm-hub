import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Review comment cannot be more than 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: function() {
      return this.price;
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    trackInventory: {
      type: Boolean,
      default: true
    }
  },
  shipping: {
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  reviews: [reviewSchema],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attributes: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  variants: [{
    name: String,
    options: [String],
    price: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return !this.isOnSale || (value > 0 && value < this.price);
      },
      message: 'Sale price must be greater than 0 and less than regular price'
    }
  },
  saleStartDate: Date,
  saleEndDate: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.isOnSale && this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for current price (sale price if on sale, otherwise regular price)
productSchema.virtual('currentPrice').get(function() {
  return this.isOnSale && this.salePrice ? this.salePrice : this.price;
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  return this.isActive && (!this.inventory.trackInventory || this.inventory.quantity > 0);
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId, limit = 20) {
  return this.find({
    category: categoryId,
    isActive: true
  })
  .populate('category', 'name slug')
  .sort({ 'ratings.average': -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    isActive: true,
    isFeatured: true
  })
  .populate('category', 'name slug')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance method to update ratings
productSchema.methods.updateRatings = async function() {
  const stats = await mongoose.model('Product').aggregate([
    { $match: { _id: this._id } },
    { $unwind: '$reviews' },
    {
      $group: {
        _id: '$_id',
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.ratings.average = Math.round(stats[0].averageRating * 10) / 10;
    this.ratings.count = stats[0].reviewCount;
  } else {
    this.ratings.average = 0;
    this.ratings.count = 0;
  }

  await this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
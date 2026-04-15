import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  image: {
    url: String,
    alt: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 3 // Maximum 3 levels deep
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
      default: 'text'
    },
    options: [String], // For select/multiselect types
    required: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for full path
categorySchema.virtual('path').get(async function() {
  if (!this.parent) return this.name;

  const parent = await this.model('Category').findById(this.parent);
  return parent ? `${parent.name} > ${this.name}` : this.name;
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  count: true
});

// Pre-save middleware to generate slug and set level
categorySchema.pre('save', async function(next) {
  // Generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Set level based on parent
  if (this.parent) {
    const parent = await this.model('Category').findById(this.parent);
    this.level = parent ? parent.level + 1 : 1;
  } else {
    this.level = 1;
  }

  next();
});

// Static method to get all active categories
categorySchema.statics.getActive = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('parent', 'name slug');
};

// Static method to get category tree
categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('parent', 'name slug');

  const buildTree = (parentId = null, level = 1) => {
    return categories
      .filter(cat => cat.level === level && String(cat.parent) === String(parentId))
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id, level + 1)
      }));
  };

  return buildTree();
};

// Static method to get subcategories
categorySchema.statics.getSubcategories = function(parentId) {
  return this.find({
    parent: parentId,
    isActive: true
  })
  .sort({ sortOrder: 1, name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
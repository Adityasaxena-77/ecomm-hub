import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getActive();

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get category tree
router.get('/tree', async (req, res) => {
  try {
    const tree = await Category.getTree();

    res.json({
      success: true,
      data: {
        categories: tree
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get subcategories
router.get('/:id/subcategories', async (req, res) => {
  try {
    const subcategories = await Category.getSubcategories(req.params.id);

    res.json({
      success: true,
      data: {
        subcategories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create category (Admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parent').optional().isMongoId().withMessage('Valid parent ID is required'),
  body('image').optional().isObject().withMessage('Image must be an object'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if parent exists and is valid
    if (req.body.parent) {
      const parent = await Category.findById(req.body.parent);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      if (parent.level >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create subcategory deeper than level 3'
        });
      }
    }

    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update category (Admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parent').optional().isMongoId().withMessage('Valid parent ID is required'),
  body('image').optional().isObject().withMessage('Image must be an object'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if parent exists and is valid
    if (req.body.parent) {
      const parent = await Category.findById(req.body.parent);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      if (parent.level >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create subcategory deeper than level 3'
        });
      }
    }

    const allowedFields = ['name', 'description', 'parent', 'image', 'isActive', 'sortOrder', 'seo', 'attributes'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('parent', 'name slug');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parent: req.params.id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Move or delete subcategories first.'
      });
    }

    // Check if category has products
    const Product = (await import('../models/Product.js')).default;
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with products. Move products to another category first.'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
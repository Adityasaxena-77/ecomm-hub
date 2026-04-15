import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price isActive inventory')
      .lean();

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
            itemCount: 0
          }
        }
      });
    }

    // Filter out inactive products or insufficient inventory
    cart.items = cart.items.filter(item => {
      const product = item.product;
      return product &&
             product.isActive &&
             (!product.inventory.trackInventory || product.inventory.quantity >= item.quantity);
    });

    // Recalculate totals
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart
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

// Add item to cart
router.post('/add', authenticate, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array')
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

    const { productId, quantity, attributes = [] } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check inventory
    if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory.quantity} items available in stock`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }

    // Add item to cart
    const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    cart.addItem(productId, quantity, price, attributes);

    await cart.save();
    await cart.populate('items.product', 'name images price isActive inventory');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart
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

// Update cart item quantity
router.put('/update/:productId', authenticate, [
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Quantity must be between 0 and 99'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array')
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

    const { productId } = req.params;
    const { quantity, attributes = [] } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (quantity === 0) {
      // Remove item
      cart.removeItem(productId, attributes);
    } else {
      // Check product availability
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or unavailable'
        });
      }

      // Check inventory
      if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory.quantity} items available in stock`
        });
      }

      cart.updateItemQuantity(productId, quantity, attributes);
    }

    await cart.save();
    await cart.populate('items.product', 'name images price isActive inventory');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart
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

// Remove item from cart
router.delete('/remove/:productId', authenticate, [
  body('attributes').optional().isArray().withMessage('Attributes must be an array')
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

    const { productId } = req.params;
    const { attributes = [] } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.removeItem(productId, attributes);
    await cart.save();
    await cart.populate('items.product', 'name images price isActive inventory');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart
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

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.clear();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart
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

// Apply coupon to cart
router.post('/coupon', authenticate, [
  body('code').trim().isLength({ min: 1 }).withMessage('Coupon code is required')
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

    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // For now, implement a simple coupon system
    // In a real app, you'd have a Coupon model
    const coupons = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'SAVE50': { discount: 50, type: 'fixed' },
      'WELCOME20': { discount: 20, type: 'percentage' }
    };

    const coupon = coupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    cart.applyCoupon(code.toUpperCase(), coupon.discount, coupon.type);
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart
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

// Remove coupon from cart
router.delete('/coupon', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.removeCoupon();
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cart
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

export default router;
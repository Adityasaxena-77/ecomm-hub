import express from 'express';import mongoose from 'mongoose';import { body, validationResult, query } from 'express-validator';
import Product from '../models/Product.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('rating').optional().isInt({ min: 1, max: 5 }).toInt()
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
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { _id: productId };
    if (rating) {
      filter['reviews.rating'] = rating;
    }

    const product = await Product.findOne(filter)
      .select('reviews name')
      .populate('reviews.user', 'name avatar')
      .slice('reviews', [skip, limit])
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get total count
    const totalReviews = await Product.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(productId) } },
      { $project: { reviewCount: { $size: '$reviews' } } }
    ]);

    const total = totalReviews[0]?.reviewCount || 0;

    res.json({
      success: true,
      data: {
        productName: product.name,
        reviews: product.reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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

// Add review to product
router.post('/product/:productId', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be 10-500 characters')
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
    const { rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(review =>
      review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    const review = {
      user: req.user._id,
      rating,
      comment,
      isVerified: false // Could be set to true if user has purchased the product
    };

    product.reviews.push(review);
    await product.save();
    await product.updateRatings();

    // Populate the new review for response
    await product.populate('reviews.user', 'name avatar');

    const newReview = product.reviews[product.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: newReview,
        product: {
          _id: product._id,
          name: product.name,
          ratings: product.ratings
        }
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

// Update user's review
router.put('/:reviewId', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be 10-500 characters')
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

    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Find product with the review
    const product = await Product.findOne({
      'reviews._id': reviewId,
      'reviews.user': req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Find and update the review
    const review = product.reviews.id(reviewId);
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await product.save();
    await product.updateRatings();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review,
        product: {
          _id: product._id,
          name: product.name,
          ratings: product.ratings
        }
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

// Delete user's review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find product with the review
    const product = await Product.findOne({
      'reviews._id': reviewId,
      'reviews.user': req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Remove the review
    product.reviews.pull(reviewId);
    await product.save();
    await product.updateRatings();

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          ratings: product.ratings
        }
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

// Get user's reviews
router.get('/user/reviews', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      'reviews.user': req.user._id
    })
    .select('name images reviews')
    .populate('reviews.user', 'name avatar')
    .slice('reviews', [skip, limit])
    .lean();

    // Extract user's reviews from products
    const reviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        if (review.user._id.toString() === req.user._id.toString()) {
          reviews.push({
            ...review,
            product: {
              _id: product._id,
              name: product.name,
              image: product.images[0]?.url || ''
            }
          });
        }
      });
    });

    // Get total count
    const totalResult = await Product.aggregate([
      { $match: { 'reviews.user': mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: null, count: { $sum: { $size: '$reviews' } } } } }
    ]);

    const total = totalResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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

// Mark review as verified (Admin only)
router.put('/:reviewId/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { reviewId } = req.params;

    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const review = product.reviews.id(reviewId);
    review.isVerified = true;

    await product.save();

    res.json({
      success: true,
      message: 'Review marked as verified',
      data: {
        review
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
# E-commerce Hub Backend API

A comprehensive REST API for an e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role management
- **Product Management** - CRUD operations with advanced filtering and search
- **Order Management** - Complete order lifecycle with tracking
- **Review System** - Product reviews with ratings and helpful votes
- **Shopping Cart & Wishlist** - Persistent cart and wishlist functionality
- **File Upload** - Image upload to Cloudinary
- **Payment Integration** - Stripe payment processing
- **Email Notifications** - Automated emails for orders and updates
- **Security** - Rate limiting, input validation, CORS, helmet
- **Admin Panel** - Administrative features for managing products and orders

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting, Input Validation
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
backend/
├── controllers/          # Request handlers
├── middleware/           # Custom middleware
│   └── auth.js          # Authentication middleware
├── models/              # MongoDB models
│   ├── User.js          # User model
│   ├── Product.js       # Product model
│   └── Order.js         # Order model
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── products.js      # Product CRUD routes
│   ├── orders.js        # Order management routes
│   ├── reviews.js       # Review system routes
│   └── upload.js        # File upload routes
├── utils/               # Utility functions
├── config/              # Configuration files
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update MONGODB_URI in .env

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/categories/list` - Get categories
- `GET /api/products/featured` - Get featured products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Reviews
- `POST /api/reviews/:productId` - Add review
- `PUT /api/reviews/:productId/:reviewId` - Update review
- `DELETE /api/reviews/:productId/:reviewId` - Delete review
- `POST /api/reviews/:productId/:reviewId/helpful` - Mark review helpful
- `GET /api/reviews/:productId` - Get product reviews

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/wishlist/:productId` - Toggle wishlist
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/cart` - Add to cart
- `PUT /api/users/cart/:productId` - Update cart item
- `DELETE /api/users/cart/:productId` - Remove from cart
- `GET /api/users/cart` - Get cart
- `GET /api/users/admin/all` - Get all users (Admin)

### File Upload
- `POST /api/upload/images` - Upload images
- `POST /api/upload/avatar` - Upload user avatar
- `DELETE /api/upload/images/:public_id` - Delete image
- `POST /api/upload/product-images` - Upload product images (Admin)

## 📊 Data Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'user' | 'admin'
  avatar: { public_id: String, url: String },
  phone: String,
  address: Object,
  wishlist: [ObjectId],
  cart: [Object],
  isVerified: Boolean
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  category: String,
  images: [{ public_id: String, url: String }],
  rating: Number,
  numReviews: Number,
  reviews: [Object],
  stock: Number,
  isActive: Boolean,
  seller: ObjectId
}
```

### Order Model
```javascript
{
  user: ObjectId,
  orderItems: [Object],
  shippingAddress: Object,
  paymentMethod: String,
  totalPrice: Number,
  orderStatus: String,
  trackingNumber: String,
  isPaid: Boolean,
  isDelivered: Boolean
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Format

### Successful Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificate
5. Set up MongoDB replica set for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@ecommhub.com or create an issue in the repository.
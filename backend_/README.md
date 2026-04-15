# E-commerce Hub Backend

A comprehensive Node.js/Express backend API for an e-commerce platform built with MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **User Management** - User registration, login, profile management
- 🛍️ **Product Management** - CRUD operations for products with categories
- 🛒 **Shopping Cart** - Add, update, remove items with coupon support
- 📦 **Order Management** - Complete order lifecycle from creation to delivery
- ⭐ **Review System** - Product reviews and ratings
- 📂 **Category Management** - Hierarchical category system
- 📊 **Admin Dashboard** - Statistics and management tools

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecomm-hub/backend
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
   Make sure MongoDB is running on your system or update `MONGODB_URI` in `.env`

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering/pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/featured/list` - Get featured products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order from cart
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `GET /api/orders/admin/stats` - Get order statistics (Admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/product/:productId` - Add product review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `GET /api/reviews/user/reviews` - Get user's reviews

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/admin/stats` - Get user statistics

## Data Models

### User
- Personal information (name, email, phone)
- Authentication (password, JWT tokens)
- Address information
- Role-based permissions (user/admin)

### Product
- Basic info (name, description, price)
- Media (images, videos)
- Inventory management
- Categories and tags
- Reviews and ratings
- SEO optimization

### Category
- Hierarchical structure (up to 3 levels)
- SEO-friendly slugs
- Custom attributes per category

### Cart
- Items with quantities and attributes
- Pricing calculations
- Coupon support
- Expiration handling

### Order
- Complete order lifecycle
- Payment tracking
- Shipping information
- Status management

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation with express-validator
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **Data Sanitization**: Prevents NoSQL injection

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Project Structure

```
backend/
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── database.js     # Database connection
├── models/             # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Cart.js
│   └── Order.js
├── routes/             # API routes
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── cart.js
│   ├── orders.js
│   ├── users.js
│   └── reviews.js
├── server.js           # Main server file
├── package.json
├── .env.example        # Environment variables template
└── README.md
```

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.
// MongoDB Schema Definitions for E-commerce Hub
// These are raw MongoDB schema definitions (alternative to Mongoose models)

const userSchema = {
  bsonType: "object",
  required: ["name", "email", "password", "role"],
  properties: {
    _id: { bsonType: "objectId" },
    name: {
      bsonType: "string",
      minLength: 2,
      maxLength: 50,
      description: "User's full name"
    },
    email: {
      bsonType: "string",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      description: "User's email address"
    },
    password: {
      bsonType: "string",
      minLength: 6,
      description: "Hashed password"
    },
    role: {
      enum: ["user", "admin"],
      description: "User role"
    },
    avatar: {
      bsonType: "object",
      properties: {
        public_id: { bsonType: "string" },
        url: { bsonType: "string" }
      }
    },
    phone: {
      bsonType: "string",
      maxLength: 15
    },
    address: {
      bsonType: "object",
      properties: {
        street: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        zipCode: { bsonType: "string" },
        country: { bsonType: "string", default: "India" }
      }
    },
    isVerified: {
      bsonType: "bool",
      default: false
    },
    verificationToken: { bsonType: "string" },
    resetPasswordToken: { bsonType: "string" },
    resetPasswordExpire: { bsonType: "date" },
    wishlist: {
      bsonType: "array",
      items: { bsonType: "objectId" }
    },
    cart: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          product: { bsonType: "objectId" },
          quantity: { bsonType: "int", minimum: 1 },
          price: { bsonType: "double", minimum: 0 }
        }
      }
    },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" }
  }
};

const productSchema = {
  bsonType: "object",
  required: ["name", "description", "price", "category", "stock", "seller"],
  properties: {
    _id: { bsonType: "objectId" },
    name: {
      bsonType: "string",
      minLength: 1,
      maxLength: 100
    },
    description: {
      bsonType: "string",
      minLength: 10,
      maxLength: 2000
    },
    price: {
      bsonType: "double",
      minimum: 0
    },
    originalPrice: {
      bsonType: "double",
      minimum: 0
    },
    discount: {
      bsonType: "double",
      minimum: 0,
      maximum: 100,
      default: 0
    },
    category: {
      enum: ["electronics", "fashion", "home", "sports", "beauty", "books", "toys", "automotive"]
    },
    brand: { bsonType: "string" },
    stock: {
      bsonType: "int",
      minimum: 0
    },
    images: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          public_id: { bsonType: "string" },
          url: { bsonType: "string" }
        }
      }
    },
    rating: {
      bsonType: "double",
      minimum: 0,
      maximum: 5,
      default: 0
    },
    numReviews: {
      bsonType: "int",
      minimum: 0,
      default: 0
    },
    reviews: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          user: { bsonType: "objectId" },
          name: { bsonType: "string" },
          rating: { bsonType: "int", minimum: 1, maximum: 5 },
          comment: { bsonType: "string" },
          date: { bsonType: "date" },
          helpful: { bsonType: "int", minimum: 0, default: 0 },
          photos: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                public_id: { bsonType: "string" },
                url: { bsonType: "string" }
              }
            }
          }
        }
      }
    },
    features: {
      bsonType: "array",
      items: { bsonType: "string" }
    },
    specifications: {
      bsonType: "object",
      additionalProperties: { bsonType: "string" }
    },
    tags: {
      bsonType: "array",
      items: { bsonType: "string" }
    },
    isActive: {
      bsonType: "bool",
      default: true
    },
    isFeatured: {
      bsonType: "bool",
      default: false
    },
    weight: {
      bsonType: "double",
      minimum: 0
    },
    dimensions: {
      bsonType: "object",
      properties: {
        length: { bsonType: "double" },
        width: { bsonType: "double" },
        height: { bsonType: "double" }
      }
    },
    warranty: {
      enum: ["none", "6 months", "1 year", "2 years", "3 years", "5 years", "lifetime"]
    },
    seller: { bsonType: "objectId" },
    salesCount: {
      bsonType: "int",
      minimum: 0,
      default: 0
    },
    viewCount: {
      bsonType: "int",
      minimum: 0,
      default: 0
    },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" }
  }
};

const orderSchema = {
  bsonType: "object",
  required: ["user", "orderItems", "shippingAddress", "paymentMethod", "totalPrice", "orderStatus"],
  properties: {
    _id: { bsonType: "objectId" },
    user: { bsonType: "objectId" },
    orderItems: {
      bsonType: "array",
      minItems: 1,
      items: {
        bsonType: "object",
        properties: {
          product: { bsonType: "objectId" },
          name: { bsonType: "string" },
          image: { bsonType: "string" },
          price: { bsonType: "double", minimum: 0 },
          quantity: { bsonType: "int", minimum: 1 }
        }
      }
    },
    shippingAddress: {
      bsonType: "object",
      properties: {
        street: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        zipCode: { bsonType: "string" },
        country: { bsonType: "string", default: "India" }
      }
    },
    paymentMethod: {
      enum: ["card", "paypal", "upi", "cod", "netbanking"]
    },
    paymentResult: {
      bsonType: "object",
      properties: {
        id: { bsonType: "string" },
        status: { bsonType: "string" },
        update_time: { bsonType: "string" },
        email_address: { bsonType: "string" }
      }
    },
    taxPrice: {
      bsonType: "double",
      minimum: 0,
      default: 0.0
    },
    shippingPrice: {
      bsonType: "double",
      minimum: 0,
      default: 0.0
    },
    totalPrice: {
      bsonType: "double",
      minimum: 0
    },
    isPaid: {
      bsonType: "bool",
      default: false
    },
    paidAt: { bsonType: "date" },
    isDelivered: {
      bsonType: "bool",
      default: false
    },
    deliveredAt: { bsonType: "date" },
    orderStatus: {
      enum: ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "placed"
    },
    trackingNumber: { bsonType: "string" },
    trackingHistory: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          status: { bsonType: "string" },
          timestamp: { bsonType: "date" },
          description: { bsonType: "string" },
          location: { bsonType: "string" }
        }
      }
    },
    cancellationReason: {
      enum: ["customer_request", "payment_failed", "out_of_stock", "other"]
    },
    refundAmount: {
      bsonType: "double",
      minimum: 0
    },
    refundStatus: {
      enum: ["none", "requested", "processing", "completed", "rejected"],
      default: "none"
    },
    notes: { bsonType: "string" },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" }
  }
};

module.exports = {
  userSchema,
  productSchema,
  orderSchema
};
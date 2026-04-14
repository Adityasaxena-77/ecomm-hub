# MongoDB Database Management

This folder contains all MongoDB-related code and utilities for the E-commerce application.

## 📁 Folder Structure

```
mongodb/
├── database.js          # Database connection and utilities
├── schemas/
│   └── schemas.js       # JSON schema definitions
├── migrations/
│   └── 001_initial_migration.js  # Database migration scripts
├── seeds/
│   └── seed.js          # Seed data for development
├── utils/
│   └── backup-restore.js # Backup and restore utilities
├── scripts/
│   ├── init-db.js       # Database initialization
│   ├── export-data.js   # Data export script
│   ├── import-data.js   # Data import script
│   ├── cleanup.js       # Database cleanup script
│   └── monitor.js       # Database monitoring script
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd mongodb
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the mongodb folder:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   NODE_ENV=development
   ```

3. **Initialize database:**
   ```bash
   npm run init
   ```

## 📋 Available Scripts

### Database Management
- `npm run init` - Initialize database with collections, indexes, and validation rules
- `npm run monitor` - Monitor database performance and health
- `npm run cleanup` - Clean up old data and optimize collections

### Data Operations
- `npm run export` - Export all collections to JSON files
- `npm run import` - Import data from JSON files
- `npm run backup` - Create database backup
- `npm run restore` - Restore database from backup

### Development
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations

## 🔧 Manual Script Usage

You can also run scripts directly with Node.js:

```bash
# Initialize database
node scripts/init-db.js

# Export data
node scripts/export-data.js

# Import data
node scripts/import-data.js

# Monitor database
node scripts/monitor.js

# Clean up database
node scripts/cleanup.js

# Backup database
node utils/backup-restore.js backup

# Restore database
node utils/backup-restore.js restore

# Seed data
node seeds/seed.js

# Run migrations
node migrations/001_initial_migration.js
```

## 📊 Database Schema

### Collections

1. **users** - User accounts and profiles
2. **products** - Product catalog
3. **orders** - Customer orders
4. **reviews** - Product reviews and ratings
5. **carts** - Shopping carts
6. **sessions** - User sessions
7. **logs** - Application logs
8. **categories** - Product categories
9. **coupons** - Discount coupons

### Indexes

- **users**: email (unique), username (unique), role, createdAt
- **products**: text search, category, price, stock, sellerId, createdAt
- **orders**: userId, status, createdAt, totalAmount
- **reviews**: productId, userId (compound unique), rating, createdAt
- **carts**: userId (unique), items.productId
- **sessions**: userId, token (unique), expiresAt (TTL)

## 🔒 Security Features

- **Validation Rules**: JSON Schema validation for data integrity
- **Unique Constraints**: Prevents duplicate emails, usernames, etc.
- **TTL Indexes**: Automatic cleanup of expired sessions
- **Input Sanitization**: Built-in validation for all operations

## 📈 Monitoring

The monitoring script provides:
- Database statistics (size, collections, documents)
- Collection-specific metrics
- Server status and performance
- Index analysis
- Slow query detection

## 🔄 Backup & Restore

- **Backup**: Exports all collections to timestamped JSON files
- **Restore**: Imports data from backup files
- **Compression**: Optional gzip compression for large datasets
- **Validation**: Data integrity checks during restore

## 🌱 Seeding

Development seed data includes:
- Sample users (admin, regular users, sellers)
- Product categories and sample products
- Test orders and reviews
- Demo coupons and configurations

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecommerce` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_BACKUP_PATH` | Backup directory path | `./backups` |

## 🐛 Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongod --version`
- Check connection string format
- Ensure network connectivity

### Permission Errors
- Check MongoDB user permissions
- Verify database user roles
- Ensure proper authentication

### Performance Issues
- Run monitoring script: `npm run monitor`
- Check slow queries
- Optimize indexes if needed

## 🤝 Contributing

1. Test scripts locally before committing
2. Update documentation for new features
3. Follow existing code patterns
4. Add proper error handling

## 📄 License

MIT License - see LICENSE file for details.
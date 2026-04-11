const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * MongoDB Data Import Script
 * Imports collections from JSON files
 */

class DataImporter {
  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      console.log('Connected to MongoDB');
      return this.client.db(this.dbName);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  async importCollection(collectionName, inputDir = './exports') {
    try {
      const db = await this.connect();
      const collection = db.collection(collectionName);

      const filePath = path.join(inputDir, `${collectionName}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found, skipping ${collectionName}`);
        return 0;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (data.length === 0) {
        console.log(`No data in ${collectionName}, skipping`);
        return 0;
      }

      // Clear existing data (optional - comment out if you want to append)
      await collection.deleteMany({});

      const result = await collection.insertMany(data);
      console.log(`Imported ${result.insertedCount} documents into ${collectionName}`);

      return result.insertedCount;
    } catch (error) {
      console.error(`Import failed for ${collectionName}:`, error);
      throw error;
    }
  }

  async importAllCollections(inputDir = './exports') {
    try {
      const db = await this.connect();

      // Get all JSON files in the input directory
      const files = fs.readdirSync(inputDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

      console.log(`Found ${files.length} JSON files to import`);

      for (const collectionName of files) {
        await this.importCollection(collectionName, inputDir);
      }

      console.log('All collections imported successfully');
    } catch (error) {
      console.error('Import all collections failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('Connection closed');
    }
  }
}

// Usage example
async function main() {
  const importer = new DataImporter(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    'ecommerce'
  );

  try {
    // Import specific collection
    // await importer.importCollection('users');

    // Import all collections
    await importer.importAllCollections('./exports');
  } catch (error) {
    console.error('Import operation failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = DataImporter;
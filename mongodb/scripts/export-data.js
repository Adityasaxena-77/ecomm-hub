const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * MongoDB Data Export Script
 * Exports collections to JSON files
 */

class DataExporter {
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

  async exportCollection(collectionName, outputDir = './exports') {
    try {
      const db = await this.connect();
      const collection = db.collection(collectionName);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const documents = await collection.find({}).toArray();
      const filePath = path.join(outputDir, `${collectionName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      console.log(`Exported ${documents.length} documents from ${collectionName} to ${filePath}`);

      return documents.length;
    } catch (error) {
      console.error(`Export failed for ${collectionName}:`, error);
      throw error;
    }
  }

  async exportAllCollections(outputDir = './exports') {
    try {
      const db = await this.connect();
      const collections = await db.listCollections().toArray();

      console.log(`Found ${collections.length} collections`);

      for (const collection of collections) {
        await this.exportCollection(collection.name, outputDir);
      }

      console.log('All collections exported successfully');
    } catch (error) {
      console.error('Export all collections failed:', error);
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
  const exporter = new DataExporter(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    'ecommerce'
  );

  try {
    // Export specific collection
    // await exporter.exportCollection('users');

    // Export all collections
    await exporter.exportAllCollections('./exports');
  } catch (error) {
    console.error('Export operation failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = DataExporter;
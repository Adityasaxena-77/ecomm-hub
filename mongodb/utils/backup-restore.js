const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const database = require('../database');

class BackupRestore {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.client = null;
  }

  async connect() {
    if (!this.client) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomm-hub';
      this.client = new MongoClient(uri);
      await this.client.connect();
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async createBackup(backupName = null) {
    try {
      console.log('🔄 Starting database backup...');

      await this.connect();
      const db = this.client.db();

      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = backupName || `backup_${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      // Get all collections
      const collections = await db.listCollections().toArray();
      const backupData = {};

      for (const collection of collections) {
        const collectionName = collection.name;
        const collectionData = await db.collection(collectionName).find({}).toArray();
        backupData[collectionName] = collectionData;
        console.log(`📄 Backed up ${collectionData.length} documents from ${collectionName}`);
      }

      // Write backup to file
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup created successfully: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async restoreBackup(backupPath) {
    try {
      console.log('🔄 Starting database restore...');

      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Database restore is only allowed in development mode');
      }

      // Read backup file
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));

      await this.connect();
      const db = this.client.db();

      // Clear existing data
      console.log('🧹 Clearing existing data...');
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
        console.log(`✅ Cleared collection: ${collection.name}`);
      }

      // Restore data
      for (const [collectionName, documents] of Object.entries(backupData)) {
        if (documents.length > 0) {
          await db.collection(collectionName).insertMany(documents);
          console.log(`✅ Restored ${documents.length} documents to ${collectionName}`);
        }
      }

      console.log('✅ Database restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const stats = fs.statSync(path.join(this.backupDir, file));
          return {
            name: file,
            path: path.join(this.backupDir, file),
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  async exportCollection(collectionName, outputPath = null) {
    try {
      console.log(`🔄 Exporting collection: ${collectionName}`);

      await this.connect();
      const db = this.client.db();

      const documents = await db.collection(collectionName).find({}).toArray();

      const outputFile = outputPath || path.join(this.backupDir, `${collectionName}_export.json`);
      await fs.writeFile(outputFile, JSON.stringify(documents, null, 2));

      console.log(`✅ Collection exported to: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async importCollection(collectionName, inputPath) {
    try {
      console.log(`🔄 Importing collection: ${collectionName}`);

      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Collection import is only allowed in development mode');
      }

      const documents = JSON.parse(await fs.readFile(inputPath, 'utf8'));

      await this.connect();
      const db = this.client.db();

      // Clear existing data in collection
      await db.collection(collectionName).deleteMany({});

      if (documents.length > 0) {
        await db.collection(collectionName).insertMany(documents);
        console.log(`✅ Imported ${documents.length} documents to ${collectionName}`);
      } else {
        console.log(`⚠️  No documents to import for ${collectionName}`);
      }
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async getDatabaseStats() {
    try {
      await this.connect();
      const db = this.client.db();

      const stats = await db.stats();
      const collections = await db.listCollections().toArray();

      const collectionStats = {};
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats[collection.name] = count;
      }

      return {
        database: stats.db,
        collections: collectionStats,
        totalSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = new BackupRestore();
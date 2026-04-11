const { MongoClient } = require('mongodb');

/**
 * MongoDB Database Monitoring Script
 * Monitors database performance, connections, and health
 */

class DatabaseMonitor {
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

  async getDatabaseStats() {
    try {
      const db = await this.connect();
      const stats = await db.stats();

      console.log('Database Statistics:');
      console.log(`- Database: ${stats.db}`);
      console.log(`- Collections: ${stats.collections}`);
      console.log(`- Documents: ${stats.objects}`);
      console.log(`- Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`- Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`- Indexes: ${stats.indexes}`);
      console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

      return stats;
    } catch (error) {
      console.error('Get database stats failed:', error);
      throw error;
    }
  }

  async getCollectionStats() {
    try {
      const db = await this.connect();
      const collections = await db.listCollections().toArray();

      console.log('\nCollection Statistics:');
      for (const collection of collections) {
        const coll = db.collection(collection.name);
        const stats = await coll.stats();

        console.log(`\n${collection.name}:`);
        console.log(`  - Documents: ${stats.count}`);
        console.log(`  - Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`  - Average Document Size: ${stats.avgObjSize} bytes`);
        console.log(`  - Indexes: ${stats.nindexes}`);
      }
    } catch (error) {
      console.error('Get collection stats failed:', error);
      throw error;
    }
  }

  async getServerStatus() {
    try {
      const db = await this.connect();
      const status = await db.admin().serverStatus();

      console.log('\nServer Status:');
      console.log(`- Version: ${status.version}`);
      console.log(`- Uptime: ${(status.uptime / 3600).toFixed(2)} hours`);
      console.log(`- Connections: ${status.connections.current} / ${status.connections.available}`);
      console.log(`- Memory Used: ${(status.mem.resident / 1024).toFixed(2)} MB`);
      console.log(`- Operations (reads/writes): ${status.opcounters.query} / ${status.opcounters.insert + status.opcounters.update + status.opcounters.delete}`);

      return status;
    } catch (error) {
      console.error('Get server status failed:', error);
      throw error;
    }
  }

  async checkIndexes() {
    try {
      const db = await this.connect();
      const collections = await db.listCollections().toArray();

      console.log('\nIndex Analysis:');
      for (const collection of collections) {
        const coll = db.collection(collection.name);
        const indexes = await coll.indexes();

        console.log(`\n${collection.name} indexes:`);
        indexes.forEach((index, i) => {
          console.log(`  ${i + 1}. ${JSON.stringify(index.key)} ${index.name ? `(${index.name})` : ''}`);
        });
      }
    } catch (error) {
      console.error('Check indexes failed:', error);
      throw error;
    }
  }

  async getSlowQueries() {
    try {
      const db = await this.connect();
      const systemProfile = db.collection('system.profile');

      // Check if profiling is enabled
      const profileSettings = await db.admin().profilingLevel();

      if (profileSettings.level === 0) {
        console.log('\nProfiling is disabled. Enable profiling to monitor slow queries.');
        console.log('To enable: db.setProfilingLevel(2, { slowms: 100 })');
        return;
      }

      const slowQueries = await systemProfile
        .find({ millis: { $gt: 100 } }) // Queries slower than 100ms
        .sort({ ts: -1 })
        .limit(10)
        .toArray();

      console.log('\nSlow Queries (last 10, >100ms):');
      slowQueries.forEach((query, i) => {
        console.log(`${i + 1}. ${query.op} on ${query.ns} - ${query.millis}ms`);
        console.log(`   Query: ${JSON.stringify(query.query)}`);
      });
    } catch (error) {
      console.error('Get slow queries failed:', error);
      throw error;
    }
  }

  async runFullMonitoring() {
    try {
      console.log('Starting database monitoring...\n');

      await this.getDatabaseStats();
      await this.getCollectionStats();
      await this.getServerStatus();
      await this.checkIndexes();
      await this.getSlowQueries();

      console.log('\nMonitoring completed');
    } catch (error) {
      console.error('Full monitoring failed:', error);
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
  const monitor = new DatabaseMonitor(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    'ecommerce'
  );

  try {
    await monitor.runFullMonitoring();
  } catch (error) {
    console.error('Monitoring operation failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseMonitor;
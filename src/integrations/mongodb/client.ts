import { MongoClient, Db } from 'mongodb';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load dotenv synchronously if in Node.js environment
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available or running in browser, continue
}

// Support both Vite (import.meta.env) and Node.js (process.env)
const getMongoUri = () => {
  const uri = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONGODB_URI 
    ? import.meta.env.VITE_MONGODB_URI
    : process.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Missing environment variable: VITE_MONGODB_URI or MONGODB_URI. Please add it to .env');
  }
  return uri;
};

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let MONGODB_URI: string | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    // Get URI on first use (lazy loading)
    if (!MONGODB_URI) {
      MONGODB_URI = getMongoUri();
    }
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function getDatabase(dbName = 'mydatabase'): Promise<Db> {
  if (!db) {
    const client = await getMongoClient();
    db = client.db(dbName);
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}

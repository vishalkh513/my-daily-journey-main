import { MongoClient, ObjectId } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.VITE_MONGODB_URI || 'mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test';

let cachedClient: MongoClient | null = null;

async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectDB();
    const db = client.db('mydatabase');

    if (req.method === 'GET') {
      // Get all posts
      const posts = await db.collection('posts')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.json(posts);
    }

    if (req.method === 'POST') {
      // Create new post
      const { userId, title, content, mood, published } = req.body;

      if (!userId || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newPost = {
        title,
        content,
        author: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        mood: mood || undefined,
        tags: [],
        published: published ?? true,
      };

      const result = await db.collection('posts').insertOne(newPost);
      return res.status(201).json({ ...newPost, _id: result.insertedId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Posts API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

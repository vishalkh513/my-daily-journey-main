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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectDB();
    const db = client.db('mydatabase');

    // GET /api/posts
    if (req.method === 'GET' && !req.url?.includes('/')) {
      const published = req.query.published !== 'false';
      const query = published ? { published: true } : {};
      
      const posts = await db.collection('posts')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.json(posts);
    }

    // POST /api/posts
    if (req.method === 'POST') {
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

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

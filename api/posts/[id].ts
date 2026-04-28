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
    const { id } = req.query;
    const postId = Array.isArray(id) ? id[0] : id;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const client = await connectDB();
    const db = client.db('mydatabase');

    if (req.method === 'GET') {
      // Get single post
      const post = await db.collection('posts').findOne({ 
        _id: new ObjectId(postId as string) 
      });
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      return res.json(post);
    }

    if (req.method === 'PUT') {
      // Update post
      const { userId, title, content, mood, published } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const post = await db.collection('posts').findOne({ 
        _id: new ObjectId(postId as string) 
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.author !== userId) {
        return res.status(403).json({ error: 'You can only edit your own posts' });
      }

      const result = await db.collection('posts').updateOne(
        { _id: new ObjectId(postId as string) },
        { 
          $set: { 
            title,
            content,
            mood: mood || undefined,
            published,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.json({ success: true, message: 'Post updated' });
    }

    if (req.method === 'DELETE') {
      // Delete post
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const post = await db.collection('posts').findOne({ 
        _id: new ObjectId(postId as string) 
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.author !== userId) {
        return res.status(403).json({ error: 'You can only delete your own posts' });
      }

      const result = await db.collection('posts').deleteOne({ 
        _id: new ObjectId(postId as string) 
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.json({ success: true, message: 'Post deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Post API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

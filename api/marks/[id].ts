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
    const markId = Array.isArray(id) ? id[0] : id;

    if (!markId) {
      return res.status(400).json({ error: 'Mark ID is required' });
    }

    const client = await connectDB();
    const db = client.db('mydatabase');

    if (req.method === 'PUT') {
      // Update mark
      const { user_id, subject, marks_obtained, total_marks, test_date, notes } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const result = await db.collection('marks').updateOne(
        { _id: new ObjectId(markId as string), user_id },
        {
          $set: {
            subject,
            marks_obtained,
            total_marks,
            test_date,
            notes: notes || null,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Mark not found or unauthorized' });
      }

      return res.json({ success: true, message: 'Mark updated' });
    }

    if (req.method === 'DELETE') {
      // Delete mark
      const { user_id, userId } = req.query;
      const finalUserId = user_id || userId;

      if (!finalUserId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const result = await db.collection('marks').deleteOne({ 
        _id: new ObjectId(markId as string), 
        user_id: finalUserId as string
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Mark not found or unauthorized' });
      }

      return res.json({ success: true, message: 'Mark deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Mark API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

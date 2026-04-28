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
      // Get all marks for user
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const marks = await db.collection('marks')
        .find({ user_id: userId as string })
        .sort({ test_date: -1, created_at: -1 })
        .toArray();
      
      return res.json(marks);
    }

    if (req.method === 'POST') {
      // Create new mark
      const { user_id, subject, marks_obtained, total_marks, test_date, notes } = req.body;

      if (!user_id || !subject || marks_obtained === undefined || total_marks === undefined || !test_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newMark = {
        user_id,
        subject,
        marks_obtained,
        total_marks,
        test_date,
        notes: notes || null,
        created_at: new Date().toISOString()
      };

      const result = await db.collection('marks').insertOne(newMark);
      
      return res.status(201).json({ ...newMark, _id: result.insertedId.toString() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Marks API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

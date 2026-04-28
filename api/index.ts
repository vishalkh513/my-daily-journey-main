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

    // POST /api/auth/signup
    if (req.method === 'POST' && req.url === '/api/auth/signup') {
      const { email, username, password, confirmPassword } = req.body;

      if (!email || !username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const newUser = {
        email,
        username,
        createdAt: new Date().toISOString()
      };

      const userResult = await db.collection('users').insertOne(newUser);
      
      const credentials = {
        userId: userResult.insertedId,
        passwordHash: password
      };

      await db.collection('credentials').insertOne(credentials);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: userResult.insertedId,
          email: newUser.email,
          username: newUser.username,
        },
      });
    }

    // POST /api/auth/signin
    if (req.method === 'POST' && req.url === '/api/auth/signin') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const credentials = await db.collection('credentials').findOne({ userId: user._id });
      if (!credentials || credentials.passwordHash !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date().toISOString() } }
      );

      return res.json({
        success: true,
        message: 'Signed in successfully',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    }

    // GET /api/health
    if (req.method === 'GET' && req.url === '/api/health') {
      return res.json({ status: 'OK', message: 'Server is running' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

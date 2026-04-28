const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = 'mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test';
let db;
let client;

async function connectDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('mydatabase');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

// Delete mark endpoint
app.delete('/api/marks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    console.log(`🗑️  Delete request - ID: ${id}, User: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const result = await db.collection('marks').deleteOne({ 
      _id: new ObjectId(id), 
      user_id: userId 
    });
    
    console.log(`Delete result:`, result);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Mark not found or unauthorized' });
    }
    
    console.log(`✅ Mark deleted: ${id}`);
    res.json({ success: true, message: 'Mark deleted' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete mark' });
  }
});

// Get marks endpoint
app.get('/api/marks', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const marks = await db.collection('marks')
      .find({ user_id: userId })
      .sort({ test_date: -1, created_at: -1 })
      .toArray();
    
    res.json(marks);
  } catch (error) {
    console.error('❌ Fetch marks error:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// Create mark endpoint
app.post('/api/marks', async (req, res) => {
  try {
    const { user_id, subject, marks_obtained, total_marks, test_date, notes } = req.body;

    console.log('📝 Create mark request:', req.body);

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
    
    console.log(`✅ Mark created: ${result.insertedId}`);
    res.status(201).json({ ...newMark, _id: result.insertedId.toString() });
  } catch (error) {
    console.error('❌ Create mark error:', error);
    res.status(500).json({ error: 'Failed to create mark' });
  }
});

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    
    console.log('📝 Signup request:', { email, username });
    
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const newUser = {
      email,
      username,
      createdAt: new Date().toISOString()
    };

    const userResult = await db.collection('users').insertOne(newUser);
    
    // Store credentials
    const credentials = {
      userId: userResult.insertedId,
      passwordHash: password // TODO: Hash this with bcryptjs
    };

    await db.collection('credentials').insertOne(credentials);

    console.log(`✅ User created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userResult.insertedId,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Signin request:', { email });
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const credentials = await db.collection('credentials').findOne({ userId: user._id });
    if (!credentials || credentials.passwordHash !== password) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );

    console.log(`✅ User signed in: ${email}`);

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('❌ Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Blog post endpoints
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(posts);
  } catch (error) {
    console.error('❌ Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { userId, title, content, mood, postDate } = req.body;

    console.log('📝 Create post request:', { userId, title, mood });

    if (!userId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPost = {
      title,
      content,
      author: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mood: mood || undefined,
      tags: [],
      published: true,
      postDate: postDate || new Date().toISOString()
    };

    const result = await db.collection('posts').insertOne(newPost);
    
    console.log(`✅ Post created: ${result.insertedId}`);
    res.status(201).json({ ...newPost, _id: result.insertedId.toString() });
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple server is running' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Simple Server running at http://localhost:${PORT}`);
    console.log(`� Authentication Endpoints:`);
    console.log(`  POST /api/auth/signup - Register new account`);
    console.log(`  POST /api/auth/signin - Login`);
    console.log(`📰 Blog Post Endpoints:`);
    console.log(`  GET  /api/posts - Get all posts`);
    console.log(`  POST /api/posts - Create new post`);
    console.log(`�📊 Marks Endpoints:`);
    console.log(`  GET  /api/marks?userId=USER_ID - Get marks`);
    console.log(`  POST /api/marks - Create mark`);
    console.log(`  DELETE /api/marks/:id?userId=USER_ID - Delete mark`);
    console.log(`🏥 Other:`);
    console.log(`  GET  /api/health - Health check`);
  });
});

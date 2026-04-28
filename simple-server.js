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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple server is running' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Simple Server running at http://localhost:${PORT}`);
    console.log(`📊 Delete endpoint: DELETE /api/marks/:id?userId=USER_ID`);
  });
});

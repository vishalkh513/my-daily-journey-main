import express, { Request, Response } from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { DatabaseService } from './integrations/mongodb/service';
import { getDatabase } from './integrations/mongodb/client';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Sign up endpoint
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const newUser = await DatabaseService.createUser({
      email,
      username,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Store password hash (in production, use bcryptjs)
    const db = await getDatabase();
    const credentialsCollection = db.collection('credentials');
    await credentialsCollection.insertOne({
      userId: newUser._id,
      passwordHash: password, // TODO: Hash this with bcryptjs in production
      createdAt: new Date(),
    });

    console.log(`✅ New user registered: ${email} (${username})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log(`🔄 Password reset attempt for: ${email}`);

    // Find user
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({ error: 'Email not found' });
    }

    // Update password
    const db = await getDatabase();
    const credentialsCollection = db.collection('credentials');
    await credentialsCollection.updateOne(
      { userId: user._id },
      { 
        $set: { 
          passwordHash: newPassword, // TODO: Hash this with bcryptjs in production
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Password reset successful for: ${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Sign in endpoint
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`🔄 Signin attempt for: ${email}`);

    // Find user
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const db = await getDatabase();
    const credentialsCollection = db.collection('credentials');
    const credentials = await credentialsCollection.findOne({ userId: user._id });

    if (!credentials || credentials.passwordHash !== password) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await DatabaseService.updateUser(user._id, {
      lastLogin: new Date(),
    });

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

// ============= MARKS ENDPOINTS =============

// Get all marks for a user
app.get('/api/marks', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = await getDatabase();
    const marksCollection = db.collection('marks');
    const marks = await marksCollection
      .find({ user_id: userId as string })
      .sort({ test_date: -1, created_at: -1 })
      .toArray();

    res.json(marks);
  } catch (error) {
    console.error('❌ Fetch marks error:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// Create a new mark
app.post('/api/marks', async (req: Request, res: Response) => {
  try {
    const { user_id, subject, marks_obtained, total_marks, test_date, notes } = req.body;

    if (!user_id || !subject || marks_obtained === undefined || total_marks === undefined || !test_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDatabase();
    const marksCollection = db.collection('marks');
    
    const newMark = {
      user_id,
      subject,
      marks_obtained,
      total_marks,
      test_date,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const result = await marksCollection.insertOne(newMark);
    
    console.log(`✅ Mark created: ${result.insertedId}`);
    res.status(201).json({ ...newMark, _id: result.insertedId.toString() });
  } catch (error) {
    console.error('❌ Create mark error:', error);
    res.status(500).json({ error: 'Failed to create mark' });
  }
});

// Update a mark
app.put('/api/marks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, subject, marks_obtained, total_marks, test_date, notes } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = await getDatabase();
    const marksCollection = db.collection('marks');
    
    const result = await marksCollection.updateOne(
      { _id: new ObjectId(id as string), user_id },
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

    console.log(`✅ Mark updated: ${id}`);
    res.json({ success: true, message: 'Mark updated' });
  } catch (error) {
    console.error('❌ Update mark error:', error);
    res.status(500).json({ error: 'Failed to update mark' });
  }
});

// Delete a mark
app.delete('/api/marks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, userId } = req.query;

    console.log('Delete request - ID:', id);
    console.log('Delete request - user_id:', user_id);
    console.log('Delete request - userId:', userId);
    console.log('Delete request - all query params:', req.query);

    // Support both user_id and userId for flexibility
    const finalUserId = user_id || userId;
    
    if (!finalUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = await getDatabase();
    const marksCollection = db.collection('marks');
    
    const result = await marksCollection.deleteOne({ 
      _id: new ObjectId(id as string), 
      user_id: finalUserId as string 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Mark not found or unauthorized' });
    }

    console.log(`✅ Mark deleted: ${id}`);
    res.json({ success: true, message: 'Mark deleted' });
  } catch (error) {
    console.error('❌ Delete mark error:', error);
    res.status(500).json({ error: 'Failed to delete mark' });
  }
});

// ============= POST ENDPOINTS =============

// Get all posts
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await DatabaseService.getAllPosts();
    const sortedPosts = posts.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    res.json(sortedPosts);
  } catch (error) {
    console.error('❌ Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get user's own posts
app.get('/api/users/:userId/posts', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getDatabase();
    const postsCollection = db.collection('posts');
    const userPosts = await postsCollection
      .find({ author: userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(userPosts);
  } catch (error) {
    console.error('❌ Fetch user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get single post
app.get('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.getPost(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('❌ Fetch post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const { userId, title, content, mood, postDate, imageUrl, published } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPost = await DatabaseService.createPost({
      title,
      content,
      author: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      mood: mood || undefined,
      tags: [],
      published: published ?? true,
    });

    console.log(`✅ Post created: ${newPost._id}`);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post (with authorization)
app.put('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, title, content, mood, published } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Verify user is the author
    const post = await DatabaseService.getPost(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const success = await DatabaseService.updatePost(id, {
      title,
      content,
      mood: mood || undefined,
      published,
      updatedAt: new Date(),
    });

    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log(`✅ Post updated: ${id}`);
    res.json({ success: true, message: 'Post updated' });
  } catch (error) {
    console.error('❌ Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (with authorization)
app.delete('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Verify user is the author
    const post = await DatabaseService.getPost(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    const success = await DatabaseService.deletePost(id);
    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log(`✅ Post deleted: ${id}`);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('❌ Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Daily Journey Server running at http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Authentication Endpoints:');
  console.log('  POST /api/auth/signup - Register new account');
  console.log('  POST /api/auth/signin - Login');
  console.log('  POST /api/auth/reset-password - Reset password');
  console.log('');
  console.log('📰 Blog Post Endpoints:');
  console.log('  GET  /api/posts - Get all posts');
  console.log('  GET  /api/posts/:id - Get single post');
  console.log('  GET  /api/users/:userId/posts - Get user posts');
  console.log('  POST /api/posts - Create new post');
  console.log('  PUT  /api/posts/:id - Update post (auth required)');
  console.log('  DELETE /api/posts/:id - Delete post (auth required)');
  console.log('');
  console.log('📊 Marks Endpoints:');
  console.log('  GET  /api/marks - Get user marks');
  console.log('  POST /api/marks - Create new mark');
  console.log('  PUT  /api/marks/:id - Update mark (auth required)');
  console.log('  DELETE /api/marks/:id - Delete mark (auth required)');
  console.log('');
  console.log('🏥 Other:');
  console.log('  GET  /api/health - Health check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

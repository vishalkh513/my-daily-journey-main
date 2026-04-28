import type { Request, Response } from 'express';
import { DatabaseService } from './service';

export async function signup(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if username exists
    const { getDatabase } = await import('./client');
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const userWithUsername = await usersCollection.findOne({ username });
    if (userWithUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Create user
    const newUser = await DatabaseService.createUser({
      email,
      username,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    });

    // Store password
    const credentialsCollection = db.collection('credentials');
    await credentialsCollection.insertOne({
      userId: newUser._id,
      passwordHash: password,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id?.toString(),
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Signup failed' });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const { getDatabase } = await import('./client');
    const db = await getDatabase();
    const credentialsCollection = db.collection('credentials');
    const credentials = await credentialsCollection.findOne({
      userId: user._id,
    });

    if (!credentials || credentials.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await DatabaseService.updateUser(user._id, {
      lastLogin: new Date(),
    });

    res.json({
      success: true,
      user: {
        id: user._id?.toString(),
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Signin failed' });
  }
}

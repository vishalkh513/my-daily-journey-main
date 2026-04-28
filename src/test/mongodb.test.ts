import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getMongoClient, getDatabase, closeDatabase, testConnection } from '../integrations/mongodb/client';
import type { Post, User } from '../integrations/mongodb/models';

describe('MongoDB Connection and Database Tests', () => {
  beforeAll(async () => {
    // Connection setup
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should connect to MongoDB successfully', async () => {
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
  });

  it('should get database instance', async () => {
    const db = await getDatabase();
    expect(db).toBeDefined();
    expect(db).not.toBeNull();
  });

  it('should ping the database', async () => {
    const client = await getMongoClient();
    const result = await client.db('admin').command({ ping: 1 });
    expect(result).toBeDefined();
    expect(result.ok).toBe(1);
  });

  it('should list database collections', async () => {
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  });

  it('should create and insert a post', async () => {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');

    const testPost: Post = {
      title: 'Test Post',
      content: 'This is a test post for MongoDB integration',
      author: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test', 'mongodb'],
      published: true,
    };

    const result = await postsCollection.insertOne(testPost);
    expect(result.insertedId).toBeDefined();

    // Clean up
    await postsCollection.deleteOne({ _id: result.insertedId });
  });

  it('should insert and retrieve a user', async () => {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const testUser: User = {
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await usersCollection.insertOne(testUser);
    expect(insertResult.insertedId).toBeDefined();

    const foundUser = await usersCollection.findOne({ _id: insertResult.insertedId });
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe('test@example.com');
    expect(foundUser?.username).toBe('testuser');

    // Clean up
    await usersCollection.deleteOne({ _id: insertResult.insertedId });
  });

  it('should update a post', async () => {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');

    const testPost: Post = {
      title: 'Original Title',
      content: 'Original content',
      author: 'Test Author',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await postsCollection.insertOne(testPost);

    const updateResult = await postsCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { title: 'Updated Title', updatedAt: new Date() } }
    );

    expect(updateResult.modifiedCount).toBe(1);

    const updatedPost = await postsCollection.findOne({ _id: insertResult.insertedId });
    expect(updatedPost?.title).toBe('Updated Title');

    // Clean up
    await postsCollection.deleteOne({ _id: insertResult.insertedId });
  });

  it('should delete a user', async () => {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const testUser: User = {
      email: 'delete.test@example.com',
      username: 'deleteuser',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await usersCollection.insertOne(testUser);

    const deleteResult = await usersCollection.deleteOne({ _id: insertResult.insertedId });
    expect(deleteResult.deletedCount).toBe(1);

    const foundUser = await usersCollection.findOne({ _id: insertResult.insertedId });
    expect(foundUser).toBeNull();
  });

  it('should query posts with filters', async () => {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');

    const posts = [
      {
        title: 'Post 1',
        content: 'Content 1',
        author: 'Author 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        published: true,
      },
      {
        title: 'Post 2',
        content: 'Content 2',
        author: 'Author 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        published: false,
      },
    ];

    const insertResult = await postsCollection.insertMany(posts);
    const insertedIds = Object.values(insertResult.insertedIds);
    expect(insertedIds.length).toBe(2);

    const publishedPosts = await postsCollection
      .find({ published: true })
      .toArray();
    expect(publishedPosts.length).toBeGreaterThanOrEqual(1);

    // Clean up
    await postsCollection.deleteMany({ _id: { $in: insertedIds } });
  });

  it('should handle database indexes', async () => {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    await usersCollection.createIndex({ email: 1 }, { unique: true }).catch(() => {
      // Index might already exist
    });

    const indexes = await usersCollection.listIndexes().toArray();
    const emailIndex = indexes.find((idx) => idx.key.email === 1);
    expect(emailIndex).toBeDefined();
  });

  it('should handle batch operations', async () => {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');

    const uniqueAuthor = `Batch Author ${Date.now()}`;
    const posts = Array.from({ length: 5 }, (_, i) => ({
      title: `Batch Post ${i + 1}`,
      content: `Content for batch post ${i + 1}`,
      author: uniqueAuthor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const insertResult = await postsCollection.insertMany(posts);
    const insertedIds = Object.values(insertResult.insertedIds);
    expect(insertedIds.length).toBe(5);

    const count = await postsCollection.countDocuments({ author: uniqueAuthor });
    expect(count).toBe(5);

    // Clean up
    await postsCollection.deleteMany({ _id: { $in: insertedIds } });
  });
});

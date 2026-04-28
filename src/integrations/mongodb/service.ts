import { getDatabase } from './client';
import type { Post, User, Mark } from './models';
import { ObjectId } from 'mongodb';

export class DatabaseService {
  /**
   * POST OPERATIONS
   */

  static async createPost(post: Omit<Post, '_id'>): Promise<Post> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const result = await postsCollection.insertOne(post);
    return { ...post, _id: result.insertedId };
  }

  static async getPost(id: string | ObjectId): Promise<Post | null> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await postsCollection.findOne({ _id: objectId });
  }

  static async getAllPosts(published?: boolean): Promise<Post[]> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const query = published !== undefined ? { published } : {};
    return await postsCollection.find(query).toArray();
  }

  static async updatePost(id: string | ObjectId, updates: Partial<Post>): Promise<boolean> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await postsCollection.updateOne(
      { _id: objectId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async deletePost(id: string | ObjectId): Promise<boolean> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await postsCollection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async searchPosts(query: string): Promise<Post[]> {
    const db = await getDatabase();
    const postsCollection = db.collection<Post>('posts');
    const regex = new RegExp(query, 'i');
    return await postsCollection
      .find({
        $or: [{ title: regex }, { content: regex }, { tags: regex }],
      })
      .toArray();
  }

  /**
   * USER OPERATIONS
   */

  static async createUser(user: Omit<User, '_id'>): Promise<User> {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const result = await usersCollection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async getUser(id: string | ObjectId): Promise<User | null> {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await usersCollection.findOne({ _id: objectId });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    return await usersCollection.findOne({ email });
  }

  static async updateUser(id: string | ObjectId, updates: Partial<User>): Promise<boolean> {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async deleteUser(id: string | ObjectId): Promise<boolean> {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await usersCollection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  /**
   * MARK OPERATIONS
   */

  static async createMark(mark: Omit<Mark, '_id'>): Promise<Mark> {
    const db = await getDatabase();
    const marksCollection = db.collection<Mark>('marks');
    const result = await marksCollection.insertOne(mark);
    return { ...mark, _id: result.insertedId };
  }

  static async getMarksByUser(userId: string): Promise<Mark[]> {
    const db = await getDatabase();
    const marksCollection = db.collection<Mark>('marks');
    return await marksCollection.find({ userId }).toArray();
  }

  static async getMarksByDateRange(startDate: Date, endDate: Date): Promise<Mark[]> {
    const db = await getDatabase();
    const marksCollection = db.collection<Mark>('marks');
    return await marksCollection
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .toArray();
  }

  static async updateMark(id: string | ObjectId, updates: Partial<Mark>): Promise<boolean> {
    const db = await getDatabase();
    const marksCollection = db.collection<Mark>('marks');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await marksCollection.updateOne({ _id: objectId }, { $set: updates });
    return result.modifiedCount > 0;
  }

  static async deleteMark(id: string | ObjectId): Promise<boolean> {
    const db = await getDatabase();
    const marksCollection = db.collection<Mark>('marks');
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await marksCollection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }
}

export default DatabaseService;

# MongoDB Integration Guide

This project includes MongoDB integration for data persistence. All database operations have been tested and are working correctly.

## Setup

### Environment Variables

Add the following to your `.env.local` file:

```env
VITE_MONGODB_URI=mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test
```

The MongoDB connection is configured and stored in `src/integrations/mongodb/`.

## Connection Status

✅ **All 11 MongoDB tests are passing:**
- Connection test
- Database instance retrieval
- Ping test
- Collection listing
- Document creation and insertion
- Document retrieval
- Document updates
- Document deletion
- Filtered queries
- Index management
- Batch operations

## File Structure

```
src/integrations/mongodb/
├── client.ts          # Core MongoDB connection and setup
├── models.ts          # TypeScript interfaces for data models
├── service.ts         # Convenience methods for CRUD operations
```

## Data Models

The following models are available:

### Post
```typescript
interface Post {
  _id?: ObjectId;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  published?: boolean;
}
```

### User
```typescript
interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

### Mark
```typescript
interface Mark {
  _id?: ObjectId;
  userId: string;
  markType: string;
  value: number;
  date: Date;
  notes?: string;
}
```

## Usage Examples

### Using the DatabaseService

```typescript
import { DatabaseService } from '@/integrations/mongodb/service';

// Create a post
const post = await DatabaseService.createPost({
  title: 'My Post',
  content: 'Post content here',
  author: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['mongodb', 'test'],
  published: true,
});

// Get a post
const retrievedPost = await DatabaseService.getPost(post._id);

// Update a post
await DatabaseService.updatePost(post._id, {
  title: 'Updated Title',
});

// Delete a post
await DatabaseService.deletePost(post._id);

// Get all published posts
const publishedPosts = await DatabaseService.getAllPosts(true);

// Search posts
const results = await DatabaseService.searchPosts('mongodb');

// Create a user
const user = await DatabaseService.createUser({
  email: 'user@example.com',
  username: 'johndoe',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Get user by email
const foundUser = await DatabaseService.getUserByEmail('user@example.com');

// Create a mark
const mark = await DatabaseService.createMark({
  userId: user._id.toString(),
  markType: 'rating',
  value: 5,
  date: new Date(),
  notes: 'Great experience',
});
```

### Direct Database Access

```typescript
import { getDatabase } from '@/integrations/mongodb/client';

const db = await getDatabase();
const collection = db.collection('posts');

// Perform any MongoDB operation directly
const result = await collection.findOne({ title: 'My Post' });
```

## Testing

Run the MongoDB tests:

```bash
npm test -- mongodb.test.ts
```

All tests should pass, confirming:
- Connection to MongoDB is successful
- Database operations work correctly
- Data integrity is maintained
- Indexes are properly created

## Features

- ✅ Automatic connection pooling
- ✅ Type-safe database operations with TypeScript
- ✅ Convenient service methods for common operations
- ✅ Support for complex queries and aggregations
- ✅ Index management
- ✅ Error handling
- ✅ Comprehensive test coverage

## Database Collections

The following collections are used in this project:

- `posts` - Blog posts with full-text search capabilities
- `users` - User accounts with email indexing
- `marks` - Daily marks/ratings with date range queries

## Notes

- MongoDB connection is automatically managed with connection pooling
- All timestamps are in UTC
- ObjectId is used for all document IDs
- Indexes are automatically created where needed
- All database operations are asynchronous

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// API base URL
const API_URL = 'http://localhost:3000/api';

// Test data
let testUserId: string;
let testUserEmail = `test-user-${Date.now()}@example.com`;
let testUsername = `testuser${Date.now()}`;
let testPassword = 'TestPassword123';
let testPostId: string;
let testMarkId: string;

describe('Authentication Tests', () => {
  it('should signup a new user with valid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        username: testUsername,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUserEmail);
    expect(data.user.username).toBe(testUsername);
    
    testUserId = data.user.id;
    console.log('✅ Signup successful:', testUserId);
  });

  it('should fail signup with duplicate email', async () => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        username: `different-${testUsername}`,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    console.log('✅ Duplicate email validation works');
  });

  it('should fail signup with mismatched passwords', async () => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `another-${testUserEmail}`,
        username: `another-${testUsername}`,
        password: testPassword,
        confirmPassword: 'DifferentPassword123',
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Passwords do not match');
    console.log('✅ Password mismatch validation works');
  });

  it('should signin with valid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: testPassword,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUserEmail);
    console.log('✅ Signin successful');
  });

  it('should fail signin with invalid password', async () => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'WrongPassword123',
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
    console.log('✅ Invalid password validation works');
  });

  it('should fail signin with non-existent email', async () => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: testPassword,
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
    console.log('✅ Non-existent user validation works');
  });
});

describe('Blog Posts Tests', () => {
  it('should create a new blog post', async () => {
    const postData = {
      userId: testUserId,
      title: 'Test Blog Post',
      content: 'This is a test blog post content with some meaningful text.',
      mood: 'happy',
      published: true,
    };

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data._id).toBeDefined();
    expect(data.title).toBe(postData.title);
    expect(data.content).toBe(postData.content);
    expect(data.author).toBe(testUserId);
    expect(data.mood).toBe('happy');
    expect(data.published).toBe(true);
    expect(data.createdAt).toBeDefined();
    
    testPostId = data._id;
    console.log('✅ Post created successfully:', testPostId);
  });

  it('should retrieve a post by ID', async () => {
    const response = await fetch(`${API_URL}/posts/${testPostId}`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data._id).toBe(testPostId);
    expect(data.title).toBe('Test Blog Post');
    console.log('✅ Post retrieved successfully');
  });

  it('should get all posts', async () => {
    const response = await fetch(`${API_URL}/posts`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    console.log(`✅ Retrieved ${data.length} posts`);
  });

  it('should update a post', async () => {
    const updatedData = {
      userId: testUserId,
      title: 'Updated Test Blog Post',
      content: 'This is updated blog post content.',
      mood: 'excited',
      published: true,
    };

    const response = await fetch(`${API_URL}/posts/${testPostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    
    // Verify the update
    const getResponse = await fetch(`${API_URL}/posts/${testPostId}`);
    const post = await getResponse.json();
    expect(post.title).toBe(updatedData.title);
    expect(post.content).toBe(updatedData.content);
    expect(post.mood).toBe('excited');
    console.log('✅ Post updated successfully');
  });

  it('should fail to update someone else\'s post', async () => {
    const otherUserId = 'some-other-user-id';
    const response = await fetch(`${API_URL}/posts/${testPostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: otherUserId,
        title: 'Hacked Title',
        content: 'Hacked content',
      }),
    });

    expect(response.status).toBe(403);
    console.log('✅ Authorization check works');
  });

  it('should delete a post', async () => {
    const response = await fetch(`${API_URL}/posts/${testPostId}?userId=${testUserId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    
    // Verify deletion
    const getResponse = await fetch(`${API_URL}/posts/${testPostId}`);
    expect(getResponse.status).toBe(404);
    console.log('✅ Post deleted successfully');
  });
});

describe('Marks Tests', () => {
  it('should create a new mark', async () => {
    const markData = {
      user_id: testUserId,
      subject: 'Mathematics',
      marks_obtained: 85,
      total_marks: 100,
      test_date: '2026-04-29',
      notes: 'Good performance on algebra',
    };

    const response = await fetch(`${API_URL}/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markData),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data._id).toBeDefined();
    expect(data.user_id).toBe(testUserId);
    expect(data.subject).toBe('Mathematics');
    expect(data.marks_obtained).toBe(85);
    expect(data.total_marks).toBe(100);
    
    testMarkId = data._id;
    console.log('✅ Mark created successfully:', testMarkId);
  });

  it('should create multiple marks for different subjects', async () => {
    const subjects = ['English', 'Science', 'History'];
    const createdIds: string[] = [];

    for (const subject of subjects) {
      const markData = {
        user_id: testUserId,
        subject,
        marks_obtained: Math.floor(Math.random() * 41) + 60, // Random marks between 60-100
        total_marks: 100,
        test_date: '2026-04-29',
        notes: `Test for ${subject}`,
      };

      const response = await fetch(`${API_URL}/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      createdIds.push(data._id);
    }

    console.log(`✅ Created ${createdIds.length} marks for different subjects`);
  });

  it('should retrieve all marks for a user', async () => {
    const response = await fetch(`${API_URL}/marks?userId=${testUserId}`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    // Verify all marks belong to the user
    data.forEach((mark: any) => {
      expect(mark.user_id).toBe(testUserId);
    });
    
    console.log(`✅ Retrieved ${data.length} marks for user`);
  });

  it('should fail to get marks without user ID', async () => {
    const response = await fetch(`${API_URL}/marks`);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    console.log('✅ Mark retrieval validation works');
  });

  it('should update a mark', async () => {
    const updatedData = {
      user_id: testUserId,
      subject: 'Mathematics',
      marks_obtained: 92,
      total_marks: 100,
      test_date: '2026-04-29',
      notes: 'Excellent performance on algebra - needs to work on geometry',
    };

    const response = await fetch(`${API_URL}/marks/${testMarkId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    console.log('✅ Mark updated successfully');
  });

  it('should delete a mark', async () => {
    const response = await fetch(`${API_URL}/marks/${testMarkId}?user_id=${testUserId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    console.log('✅ Mark deleted successfully');
  });

  it('should fail to delete mark without user ID', async () => {
    const response = await fetch(`${API_URL}/marks/${testMarkId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(400);
    console.log('✅ Mark deletion validation works');
  });
});

describe('Data Validation Tests', () => {
  it('should fail to create post without required fields', async () => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        title: 'Only Title',
        // missing content
      }),
    });

    expect(response.status).toBe(400);
    console.log('✅ Post validation works');
  });

  it('should fail to create mark without required fields', async () => {
    const response = await fetch(`${API_URL}/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: testUserId,
        subject: 'Math',
        // missing marks and test_date
      }),
    });

    expect(response.status).toBe(400);
    console.log('✅ Mark validation works');
  });
});

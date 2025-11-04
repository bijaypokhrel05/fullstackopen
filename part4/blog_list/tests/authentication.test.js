const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const mongoose = require('mongoose')
const { test, before, beforeEach, after } = require('node:test');

let token = null;

before(async () => {
  const { MONGODB_URL } = require('../utils/config');
  await mongoose.connect(MONGODB_URL);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  
  // Create user directly to avoid API validation issues
  const passwordHash = await bcrypt.hash('password', 10);
  const user = new User({
    username: 'testuser',
    password: passwordHash,
    name: 'Test User'
  });
  await user.save();
  
  // Small delay to ensure user is indexed and available
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Try to get token - if it fails, the test will handle recreation
  try {
    const loginResponse = await api.post('/api/login')
      .send({ username: 'testuser', password: 'password' });
    
    if (loginResponse.status === 200 && loginResponse.body.token) {
      token = loginResponse.body.token;
    } else {
      // Login failed, but don't throw - let test handle it
      token = null;
    }
  } catch (error) {
    // Login failed, but don't throw - let test handle it
    token = null;
  }
});

after(async () => {
  await mongoose.connection.close();
});


// Test adding blog with token
test('a valid blog can be added with token', async () => {
  const assert = require('node:assert');
  
  // Ensure user exists and get a valid token - handle test interference
  let user = await User.findOne({ username: 'testuser' });
  let validToken = token;
  let needNewToken = false;
  
  // Verify token is valid for current user if both exist
  if (user && validToken) {
    try {
      const decodedToken = jwt.verify(validToken, config.SECRET);
      // Check if token's user ID matches current user
      if (!decodedToken.id || decodedToken.id.toString() !== user._id.toString()) {
        needNewToken = true;
      }
    } catch (error) {
      // Token is invalid
      needNewToken = true;
    }
  }
  
  if (!user || !validToken || needNewToken) {
    // User or token is missing/invalid - recreate user and get fresh token
    if (!user) {
      // Delete any existing user with this username
      await User.deleteMany({ username: 'testuser' });
      
      // Wait a moment for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create new user
      const passwordHash = await bcrypt.hash('password', 10);
      user = new User({
        username: 'testuser',
        password: passwordHash,
        name: 'Test User'
      });
      await user.save();
      
      // Wait for user to be indexed and available
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify user exists before trying to login
      let verifyUser = await User.findOne({ username: 'testuser' });
      let verifyRetries = 0;
      while (!verifyUser && verifyRetries < 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        verifyUser = await User.findOne({ username: 'testuser' });
        verifyRetries++;
      }
      
      if (!verifyUser) {
        throw new Error('Failed to create user for authentication test');
      }
    }
    
    // Get fresh token for the user with retry logic
    let loginResponse = null;
    let loginRetries = 0;
    while (loginRetries < 5 && (!loginResponse || loginResponse.status !== 200)) {
      try {
        loginResponse = await api.post('/api/login')
          .send({ username: 'testuser', password: 'password' });
        
        if (loginResponse.status === 200 && loginResponse.body.token) {
          validToken = loginResponse.body.token;
          break;
        }
      } catch (error) {
        // Continue retrying
      }
      
      if (loginRetries < 4) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      loginRetries++;
    }
    
    if (!loginResponse || loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(`Failed to get token after retries. Status: ${loginResponse?.status}, Response: ${JSON.stringify(loginResponse?.body)}`);
    }
  }
  
  // Verify token is valid by checking if user can be found
  if (!validToken) {
    throw new Error('Token is not available');
  }
  
  const newBlog = {
    title: 'Test Blog',
    author: 'Tester',
    url: 'http://example.com',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${validToken}`)
    .send(newBlog);

  // Check response status and handle errors
  if (response.status !== 201) {
    // If we get an error, try to see what went wrong
    const errorMsg = response.body?.error || response.body?.message || JSON.stringify(response.body);
    throw new Error(`Expected 201, got ${response.status}. Error: ${errorMsg}`);
  }

  assert.strictEqual(response.status, 201);
  assert.match(response.headers['content-type'], /application\/json/);
  
  // Verify the blog was created (check response body first)
  assert.ok(response.body.id || response.body._id, 'Blog should have an id');
  assert.strictEqual(response.body.title, 'Test Blog');
  
  // Find the blog in database to verify it was saved
  const createdBlog = await Blog.findById(response.body.id || response.body._id);
  assert.ok(createdBlog, 'Blog should exist in database');
  assert.strictEqual(createdBlog.title, 'Test Blog');
})

test('adding blog fails with 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'Nobody',
    url: 'http://example.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

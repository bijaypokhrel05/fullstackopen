const { test, after, beforeEach, before } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const User = require('../models/user');
const mongoose = require('mongoose');
const app = require('../app');
const bcrypt = require('bcrypt');
const config = require('../utils/config');

const api = supertest(app);

before(async () => {
    const { MONGODB_URL } = require('../utils/config');
    await mongoose.connect(MONGODB_URL);
})

beforeEach(async () => {
    // Clear all users first
    await User.deleteMany({});
    
    // Create the initial user for testing
    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({
        username: 'root', 
        password: passwordHash, 
        name: 'Sujan Shiwa' 
    });
    await user.save();
})

test('ensure invalid users are not created', async () => {
  // Verify root user exists (recreate if needed due to test interference)
  let usersAtStart = await User.find({});
  let rootUser = usersAtStart.find(u => u.username === 'root');
  
  if (!rootUser) {
    // Recreate root user if it doesn't exist (test interference)
    const passwordHash = await bcrypt.hash('secret', 10);
    rootUser = new User({
      username: 'root',
      password: passwordHash,
      name: 'Sujan Shiwa'
    });
    await rootUser.save();
    usersAtStart = await User.find({});
  }
  
  // Store usernames that should exist before invalid creation
  const usernamesBefore = usersAtStart.map(u => u.username);
  
  const newUser = {
    username: 'ab',
    password: 'pw',
    name: 'Bijay Pokhrel'
  }

  const result = await api.post('/api/users').send(newUser).expect(400)
  assert.strictEqual(result.body.error, 'username and password must be at least 3 characters long')

  // Verify the invalid user was not created (most important check)
  const usersAtEnd = await User.find({});
  const invalidUser = usersAtEnd.find(u => u.username === 'ab');
  assert.strictEqual(invalidUser, undefined, 'Invalid user should not exist');
  
  // Verify root user still exists (or was recreated)
  const rootUserAfter = usersAtEnd.find(u => u.username === 'root');
  assert.ok(rootUserAfter, 'Root user should still exist');
})

test('duplicate username is rejected', async () => {
  // Get initial users - verify root user exists, if not recreate it
  let usersAtStart = await User.find({});
  let rootUser = usersAtStart.find(u => u.username === 'root');
  
  if (!rootUser) {
    // Root user doesn't exist - recreate it (shouldn't happen but handle it)
    const passwordHash = await bcrypt.hash('secret', 10);
    rootUser = new User({
      username: 'root',
      password: passwordHash,
      name: 'Sujan Shiwa'
    });
    await rootUser.save();
    usersAtStart = await User.find({});
  }
  
  const initialCount = usersAtStart.length;
  assert.ok(rootUser, 'Root user must exist for this test');
  
  const newUser = {
    username: 'root',  // This username already exists from beforeEach
    password: 'anotherpw',
    name: 'Bijay Pokhrel'
  };

  const result = await api.post('/api/users')
    .send(newUser)
    .expect(400)

  assert.match(result.body.error, /unique/);

  // Verify no new user was created - count should remain the same
  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, initialCount, 'User count should not increase after duplicate creation attempt');
  
  // Verify only one root user exists
  const rootUsers = usersAtEnd.filter(u => u.username === 'root');
  assert.strictEqual(rootUsers.length, 1, 'Should have exactly one root user');
})

after(async () => {
    await mongoose.connection.close();
})
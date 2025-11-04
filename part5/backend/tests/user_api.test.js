const { test, after, beforeEach, before } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const User = require('../models/user');
const mongoose = require('mongoose');
const app = require('../app');
const bcrypt = require('bcrypt');
const config = require('../utils/config');

const api = supertest(app);

before (async () => {
    await mongoose.connect(config.MONGODB_URL);
})

beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({username: 'root', password: passwordHash, name: 'Sujan Shiwa' })
    await user.save();
})

test('ensure invalid users are not created', async () => {
  const newUser = {
    username: 'ab',
    password: 'pw',
    name: 'Bijay Pokhrel'
  }

  const result = await api.post('/api/users').send(newUser).expect(400)
  assert.strictEqual(result.body.error, 'username and password must be at least 3 characters long')

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 1);
})

test('duplicate username is rejected', async () => {
  const newUser = {
    username: 'bijaypokhrel',
    password: 'anotherpw',
    name: 'Bijay Pokhrel'
  };

  const result = await api.post('/api/users')
  .send(newUser)
  .expect(400)

  assert.match(result.body.error, /unique/);

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 1);
})

after(async () => {
    await mongoose.connection.close();
})
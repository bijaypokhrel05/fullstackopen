const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const { test, before, beforeEach } = require('node:test');

let token = null;

before(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', password: passwordHash, name: 'Test User' })
  await user.save()

  const userForToken = { username: user.username, id: user._id }
  token = jwt.sign(userForToken, config.SECRET)
})

beforeEach(async () => {
  await User.deleteMany({});
  const user = { username: 'testuser', password: 'password' };

  await api.post('/api/users').send(user);

  const login = await api.post('/api/login').send(user);
  token = login.body.token;

  await Blog.deleteMany({});
});


// Test adding blog with token
test('a valid blog can be added with token', async () => {
  const newBlog = {
    title: 'Test Blog',
    author: 'Tester',
    url: 'http://example.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(1)
  expect(blogsAtEnd[0].title).toBe('Test Blog')
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

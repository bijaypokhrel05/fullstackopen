const app = require('../app');
const Blog = require('../models/blog');
const supertest = require('supertest');
const assert = require('node:assert');
const { test, before, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');

const api = supertest(app);

before(async () => {
    const { MONGODB_URL } = require('../utils/config');
    await mongoose.connect(MONGODB_URL);
});

beforeEach(async () => {
    await Blog.deleteMany({});

    const newObject1 = new Blog(
        {
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5
        }
    )
    
    const newObject2 = new Blog(
        {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12
        }
    )
    await newObject1.save();
    await newObject2.save();
});

test('blogs are returned as JSON and correct amount', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.length, 2);
});

test('unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs').expect(200);

    response.body.forEach(blog => {
        assert.ok(blog.id, 'Blog is missing id property');
        assert.strictEqual(blog._id, undefined, '_id not exist');
    })
});

test('post the new blog successfully', async () => {
    try {
        const blogsAtStart = await Blog.find({});
        const newBlog = {
            title: "Think like a Monk",
            author: "Sankhar Bir Tamang",
            url: "http://localhost:4023/api/blogs/think-like-a-monk",
            likes: 15
        }

        await api.post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        //Fetch all blogs
        const blogsAtEnd = await Blog.find({});
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1, 'Total number of blogs should increase by one');
    } catch (err) {
        console.log('Error', err);
    }
});

test('verify likes property is missing or not, If missing then give default value 0', async () => {
    const newBlog = {
        title: 'JavaScript is Funny',
        author: 'Sanjeev Rai',
        url: 'http://localhost:3200/javascript-is-funny/'
    }

    const response = await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.likes, 0, 'Likes should default to 0');
});

test('title and url are required field and if missed returns 400 Bad request', async () => {
    const newBlog = {
        author: 'Sankhar Bir Tamang',
        url: 'www.sankhar.com',
        likes: 9
    }

    const response = await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/);
});

test ('a blog can be deleted', async () => {
    const blogsAtStart = await Blog.find({});
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);

    const blogsAtEnd = await Blog.find({});
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length -1);

    const ids = blogsAtEnd.map(b => b.id);
    assert(!ids.includes(blogToDelete.id));
});

test ('a blog can be updated', async () => {
    const blogsAtStart = await Blog.find({});
    const needToUpdate = blogsAtStart[1];

    const updatedInfo = {
        title: needToUpdate.title,
        author: needToUpdate.author,
        url: 'http://localhost:32353/sanjeev-rai-kto',
        likes: needToUpdate.likes + 10
    }

    const response = await api.put(`/api/blogs/${needToUpdate.id}`)
    .send(updatedInfo)
    .expect(200)
    .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.url, 'http://localhost:32353/sanjeev-rai-kto');
    assert.strictEqual(response.body.likes, needToUpdate.likes + 10);

    const blogAfterUpdate = await Blog.findById(needToUpdate.id);
    assert.strictEqual(blogAfterUpdate.likes, needToUpdate.likes + 10);
});

test ('add blogs with unauthorized user will fails', () => {
    
});

after(async () => {
    await mongoose.connection.close();
})


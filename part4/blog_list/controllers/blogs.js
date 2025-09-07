const Blog = require('../model/blog');
const blogsRouter = require('express').Router();

blogsRouter.get('/api/blogs', (req, res) => {
    Blog.find({}).then(blogs => res.json(blogs));
})

blogsRouter.post('/api/blogs', (req, res) => {
    const body = req.body;
    const newBlog = new Blog(body);
    newBlog.save().then(blog => res.status(201).json(blog));
})

module.exports = blogsRouter;
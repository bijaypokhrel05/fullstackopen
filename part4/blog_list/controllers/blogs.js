const Blog = require('../model/blog');
const blogsRouter = require('express').Router();

blogsRouter.get('/', (req, res) => {
    Blog.find({}).then(blogs => res.json(blogs));
})

blogsRouter.post('/', (req, res) => {
    const body = req.body;
    const newBlog = new Blog(body);
    newBlog.save().then(blog => res.status(201).json(blog));
})

module.exports = blogsRouter;
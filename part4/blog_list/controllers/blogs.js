const Blog = require('../models/blog');
const User = require('./users');
const blogsRouter = require('express').Router();

blogsRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
        res.json(blogs);
    } catch (err) {
        next(err);
    }
});

blogsRouter.post('/', async (req, res, next) => {
    try {
        const { title, author, url, likes, userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const newBlog = new Blog({
            title,
            author,
            url,
            likes: likes || 0,
            user: user._id
        });

        const savedBlog = await newBlog.save();

        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        const populatedBlog = await savedBlog.populate('user', {username: 1, name: 1})
        res.status(201).json(populatedBlog);
    } catch (err) {
        next(err);
    }
});

blogsRouter.delete('/:id', async (req, res, next) => {
    try {
        const blogId = req.params.id;
        const deletedBlog = await Blog.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(204).end();
    } catch (error) {
        next(error);
    }

});

blogsRouter.put('/:id', async (req, res, next) => {
    try {
        const blogId = req.params.id;
        const body = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes
        },
            { new: true, runValidators: true, context: 'query' });

        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(updatedBlog);
    } catch (error) {
        next(error);
    }
});

module.exports = blogsRouter;

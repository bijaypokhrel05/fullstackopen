const Blog = require('../model/blog');
const blogsRouter = require('express').Router();

blogsRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog.find({});
        res.json(blogs);
    } catch (err) {
        next(err);
    }
});

blogsRouter.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        const newBlog = new Blog(body);
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
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

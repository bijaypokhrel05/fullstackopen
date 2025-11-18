const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

// Get all blogs
blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

// Create a new blog
blogsRouter.post('/', userExtractor, async (req, res) => {
  const { title, author, url, likes } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'user not authenticated' });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: req.user._id,
  });

  const savedBlog = await blog.save();
  req.user.blogs = req.user.blogs.concat(savedBlog._id);
  await req.user.save();

  res.status(201).json(savedBlog);
});


// Delete a blog
blogsRouter.delete('/:id', userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'blog not found' });
    }

    if (!req.user || blog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Update a blog
blogsRouter.put('/:id', userExtractor, async (req, res, next) => {
  try {
    const { likes } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { likes },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: 'blog not found' });
    }

    res.json(updatedBlog);
  } catch (err) {
    next(err);
  }
});

module.exports = blogsRouter;

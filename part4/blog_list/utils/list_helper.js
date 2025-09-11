const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((res, blog) => {
        res += blog.likes;
        return res;
    }, 0);
};

const favoriteBlog = (blogs) => {
    let maxLikes = -Infinity;
    for (let blog of blogs) {
        maxLikes = Math.max(maxLikes, blog.likes);
    }
    for (let blog of blogs) {
        if (maxLikes === blog.likes) {
            return blog;
        }
    }
};

const mostBlog = (blogs) => {
    const blogsFreq = {};
    for (let blog of blogs) {
        blogsFreq[blog.author] = (blogsFreq[blog.author] || 0) + 1;
    }
    console.log()
    const mostBlogAuth = {author: null, blogs: -Infinity};
    for (let [key, value] of Object.entries(blogsFreq)) {
        if (mostBlogAuth.blogs < value) {
            mostBlogAuth.author = key;
            mostBlogAuth.blogs = value;
        }
    }
    return mostBlogAuth;
};

const mostLikes = (blogs) => {
    const blogsFreq = {};
    for (let blog of blogs) {
        blogsFreq[blog.author] = (blogsFreq[blog.author] || 0) + blog.likes;
    }

    const mostFamousAuthor = {author: null, likes: -Infinity};
    for (let [key, value] of Object.entries(blogsFreq)) {
        if (mostFamousAuthor.likes < value) {
            mostFamousAuthor.author = key;
            mostFamousAuthor.likes = value;
        }
    }
    return mostFamousAuthor;
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlog, mostLikes };
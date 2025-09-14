const mongoose = require('mongoose');
const Blog = require('./blog');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        minLength: 3,
        required: true
    },
    name: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
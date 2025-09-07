const mongoose = require("mongoose");
const config = require("../utils/config");

mongoose.connect(config.MONGODB_URL).then(() => console.log("MongoDB is connected successfully!"))
.catch(err => console.log("Error connecting to MongoDB:", err.message));

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    like: Number
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
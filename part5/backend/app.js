const express = require("express");
const cors = require("cors");
const middleware = require("./utils/middleware");
const loginRouter = require('./controllers/login');
const blogsRouter = require("./controllers/blogs");
const usersRouter = require('./controllers/users');

const app = express();
app.use(cors());

app.use(express.json());

app.use(middleware.requestLogger);

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);

app.use(middleware.tokenExtractor);
app.use('/api/blogs', blogsRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
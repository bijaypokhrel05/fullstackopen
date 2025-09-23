require("dotenv").config();

const MONGODB_URL = process.env.NODE_ENV !== 'test' ? process.env.MONGODB_URL: process.env.MONGODB_TEST_URL;
const PORT = process.env.PORT ? process.env.PORT: 3001;

const SECRET = process.env.SECRET;

module.exports = { MONGODB_URL, PORT, SECRET };
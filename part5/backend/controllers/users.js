const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../utils/logger');
const usersRouter = require('express').Router();

// POST /api/users → create new user
usersRouter.post('/', async (req, res) => {
    console.log("POST /api/users hit");
    console.log("Body received:", req.body);

    try {
        const { username, password, name } = req.body;

        // 1. Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        if (username.length < 3 || password.length < 3) {
            return res.status(400).json({ error: 'username and password must be at least 3 characters long' });
        }

        // 2. Check for existing user
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'username must be unique' });
        }

        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Create and save user
        const user = new User({
            username,
            password: passwordHash,
            name
        });

        const savedUser = await user.save();
        console.log("User saved:", savedUser);

        return res.status(201).json({ msg: "User created successfully", user: savedUser });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// GET /api/users → list all users
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({})
            .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });

        const allUsers = users.map(user => ({
            username: user.username,
            name: user.name,
            id: user._id
        }));

        return res.status(200).json(allUsers);
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: 'Something went wrong while fetching users' });
    }
});

module.exports = usersRouter;

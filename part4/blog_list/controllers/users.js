const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../utils/logger')
const usersRouter = require('express').Router();

usersRouter.post('/', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' })
        }

        if (username.length < 3 || password.length < 3) {
            return res.status(400).json({ error: 'username and password must be at least 3 characters long'})
        }

        const exisitingUser = await User.findOne({ username });
        if (exisitingUser) {
            return res.status(400).json({ error: 'username must be unique'})
        }
        
        const passwordHash = await bcrypt.hash(body.password, 10);
        const user = new User({
            username,
            password: passwordHash,
            name
        })

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.log("Error", error);
    }
});

usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({})
        .populate('blogs', {title: 1, author: 1, url: 1, likes: 1 });
        const allUsers = users.map(user => {
            return {
                username: user.username,
                name: user.name,
                id: user._id
            }
        });
        res.status(200).json(allUsers);
    } catch(error) {
        logger.error(error);
        res.status(500).json({ error: 'Something went wrong while fetching users' });
    }
});

module.exports = usersRouter;
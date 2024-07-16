const jwt = require('jsonwebtoken');
const User = require('../model/User');
require('dotenv').config();


const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach the user object to the request
        console.log(req.user);
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

module.exports = verifyToken



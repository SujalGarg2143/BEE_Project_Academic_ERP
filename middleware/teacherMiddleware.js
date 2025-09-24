const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Protect routes and check for teacher role
const teacher = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user from DB
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'Not authorized' });

        // Check role
        if (user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied: Teachers only' });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = teacher;

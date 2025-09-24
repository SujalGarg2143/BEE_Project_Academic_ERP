const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Protect routes and check for admin role
const admin = async (req, res, next) => {
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
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = admin;

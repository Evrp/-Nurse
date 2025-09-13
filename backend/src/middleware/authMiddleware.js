
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const protect = (req, res, next) => {
    let token;

    // Check if token is in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // Optionally, check for Authorization header as a fallback or for API clients
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token found' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };

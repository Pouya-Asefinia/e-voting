const jwt = require('jsonwebtoken');

// check the token
const auth = (req, res, next) => {
    try {
        // get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'لطفا وارد شوید'
            });
        }

        // check the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'توکن نامعتبر است'
        });
    }
};

// check the admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'دسترسی فقط برای مدیران'
        });
    }
    next();
};

module.exports = { auth, adminOnly };
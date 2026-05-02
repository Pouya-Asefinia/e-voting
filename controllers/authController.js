const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Signup
exports.register = async (req, res) => {
    try {
        const { username, password, full_name } = req.body;
        
        // Check if fields are empty
        if (!username || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'لطفا همه فیلد ها را پر کنید'
            });
        }

        // Check if the user exists
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json ({
                success: false,
                message: 'این نام کاربری قبلا ثبت شده'
            });
        }

        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // save in database
        await pool.query(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, full_name, 'voter']
        );

        res.status(201).json({
            success: true,
            message: 'ثبت نام با موفقیت انجام شد'
        });

    } catch (error) {
        console.error('خطا در ثبت نام', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if fields are empty
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'لطفا نام کاربری و رمز عبور را وارد کنید'
            });
        }

        // find the user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        ) ;

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'نام کاربری یا رمز عبور اشتباه است'
            });
        }

        const user = users[0];

        // check the password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'نام کاربری یا پسورد اشتباه است'
            });
        }

        // create token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );

        res.json({
            success: true,
            message: 'ورود موفقیت آمیز',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('خطا در لاگین', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Current user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, full_name, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('خطا در دریافت پروفایل:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};
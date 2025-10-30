const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Get user from database
        const [users] = await db.query(
            'SELECT * FROM Staff WHERE username = ? AND status = ?',
            [username, 'Active']
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                staff_id: user.staff_id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    staff_id: user.staff_id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Register (Admin only)
exports.register = async (req, res) => {
    try {
        const { username, password, first_name, last_name, email, role, hired_date } = req.body;

        // Validation
        if (!username || !password || !first_name || !last_name || !email || !hired_date) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if username or email already exists
        const [existing] = await db.query(
            'SELECT * FROM Staff WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert new staff
        const [result] = await db.query(
            `INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, password_hash, first_name, last_name, email, role || 'Librarian', hired_date]
        );

        res.status(201).json({
            success: true,
            message: 'Staff member registered successfully',
            data: {
                staff_id: result.insertId,
                username,
                first_name,
                last_name,
                email,
                role: role || 'Librarian'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT staff_id, username, first_name, last_name, email, role, hired_date, status FROM Staff WHERE staff_id = ?',
            [req.user.staff_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};

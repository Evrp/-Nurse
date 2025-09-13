
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');
const { jwtSecret } = require('../config/config');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide name, email, password, and role.' });
    }

    if (role !== 'nurse' && role !== 'head_nurse') {
        return res.status(400).json({ message: 'Role must be either nurse or head_nurse.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Error registering user', error });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000 // 1 hour
        });
        res.json({ message: 'Logged in successfully', role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

exports.getNurses = async (req, res) => {
    try {
        const [nurses] = await pool.query('SELECT id, name, email, role FROM users WHERE role = ?', ['nurse']);
        res.json(nurses);
    } catch (error) {
        console.error('Error fetching nurses:', error);
        res.status(500).json({ message: 'Error fetching nurses' });
    }
};

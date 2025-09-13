
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/config');

const pool = mysql.createPool(dbConfig);

const sync = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('Creating tables if they do not exist...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('nurse', 'head_nurse') NOT NULL
            );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS shifts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                ward VARCHAR(255) NOT NULL
            );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS shift_assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                shift_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (shift_id) REFERENCES shifts(id)
            );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                shift_assignment_id INT NOT NULL,
                reason TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                approved_by INT,
                FOREIGN KEY (shift_assignment_id) REFERENCES shift_assignments(id),
                FOREIGN KEY (approved_by) REFERENCES users(id)
            );
        `);
        console.log('Tables created successfully.');
    } finally {
        connection.release();
    }
};

module.exports = { pool, sync };


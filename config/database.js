const mysql = require('mysql2/promise');
require('dotenv').config();

// Create Connection to Database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:  process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Server Test
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ اتصال به دیتابیس برقرار شد!');
        connection.release();
    } catch (error) {
        console.error('❌ خطا در اتصال به دیتابیس:', error.message);
    }
}

module.exports = { pool, testConnection };
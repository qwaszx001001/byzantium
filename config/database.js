const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../config.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database terhubung dengan sukses!');
        connection.release();
    } catch (error) {
        console.error('Error koneksi database:', error.message);
    }
};

testConnection();

module.exports = pool; 
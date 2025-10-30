const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'LibraryManagementSystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
    .then(async connection => {
        console.log('✅ Database connected successfully');
        
        // Test required stored procedures
        try {
            await connection.query('CALL GetDailyStatistics()');
            console.log('✅ Required stored procedures exist');
        } catch (err) {
            console.error('❌ Stored procedure error:', err.message);
            console.error('Please load the stored procedures from database/procedures.sql');
        }
        
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Connection details:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });
        process.exit(1);
    });

module.exports = pool;

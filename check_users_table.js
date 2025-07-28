const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsersTable() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'byzantiumedu'
        });

        console.log('✅ Connected to database');

        // Check users table structure
        const [columns] = await connection.execute(`
            DESCRIBE users
        `);
        
        console.log('📋 Users table structure:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check current role values
        const [roles] = await connection.execute(`
            SELECT DISTINCT role FROM users
        `);
        
        console.log('\n🎭 Current role values:');
        roles.forEach(row => {
            console.log(`- ${row.role}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the check
checkUsersTable(); 
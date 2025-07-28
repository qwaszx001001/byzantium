const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoleEnum() {
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

        // Update role column to include 'instructor'
        await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'admin', 'instructor') DEFAULT 'user'
        `);
        console.log('✅ Updated role ENUM to include instructor');

        // Verify the change
        const [columns] = await connection.execute(`
            DESCRIBE users
        `);
        
        const roleColumn = columns.find(col => col.Field === 'role');
        console.log('📋 Updated role column:', roleColumn.Type);

        console.log('✅ Role ENUM fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating role ENUM:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the fix
fixRoleEnum(); 
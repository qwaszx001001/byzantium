const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateInstructorSchema() {
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

        // Add instructor_id column to courses table if not exists
        try {
            await connection.execute(`
                ALTER TABLE courses 
                ADD COLUMN instructor_id INT NULL,
                ADD FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log('✅ Added instructor_id column to courses table');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ instructor_id column already exists in courses table');
            } else {
                throw error;
            }
        }

        // Add bio column to users table if not exists
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN bio TEXT NULL
            `);
            console.log('✅ Added bio column to users table');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ bio column already exists in users table');
            } else {
                throw error;
            }
        }

        // Add avatar column to users table if not exists
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN avatar VARCHAR(255) NULL
            `);
            console.log('✅ Added avatar column to users table');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ avatar column already exists in users table');
            } else {
                throw error;
            }
        }

        // Update existing courses to have instructor_id (set to admin user)
        try {
            const [adminUsers] = await connection.execute(`
                SELECT id FROM users WHERE role = 'admin' LIMIT 1
            `);
            
            if (adminUsers.length > 0) {
                await connection.execute(`
                    UPDATE courses 
                    SET instructor_id = ? 
                    WHERE instructor_id IS NULL
                `, [adminUsers[0].id]);
                console.log('✅ Updated existing courses with instructor_id');
            }
        } catch (error) {
            console.log('⚠️ Could not update existing courses with instructor_id:', error.message);
        }

        console.log('✅ Instructor schema update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating instructor schema:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the update
updateInstructorSchema(); 
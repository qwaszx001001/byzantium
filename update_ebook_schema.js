const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateEbookSchema() {
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

        // Create ebooks table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS ebooks (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                pdf_file VARCHAR(255) NOT NULL,
                category_id INT,
                author_id INT NOT NULL,
                status ENUM('draft', 'published') DEFAULT 'published',
                download_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created ebooks table');

        // Add download_count column if not exists
        try {
            await connection.execute(`
                ALTER TABLE ebooks 
                ADD COLUMN download_count INT DEFAULT 0
            `);
            console.log('✅ Added download_count column to ebooks');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ download_count column already exists in ebooks table');
            } else {
                throw error;
            }
        }

        // Add slug column if not exists
        try {
            await connection.execute(`
                ALTER TABLE ebooks 
                ADD COLUMN slug VARCHAR(255) NOT NULL UNIQUE
            `);
            console.log('✅ Added slug column to ebooks');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ slug column already exists in ebooks table');
            } else {
                throw error;
            }
        }

        console.log('✅ Ebook schema update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating ebook schema:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the update
updateEbookSchema(); 
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePediaSchema() {
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

        // Create pedia_articles table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pedia_articles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                content TEXT NOT NULL,
                excerpt TEXT,
                featured_image VARCHAR(255),
                category_id INT,
                author_id INT NOT NULL,
                status ENUM('draft', 'published') DEFAULT 'draft',
                view_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created pedia_articles table');

        // Add view_count column if not exists
        try {
            await connection.execute(`
                ALTER TABLE pedia_articles 
                ADD COLUMN view_count INT DEFAULT 0
            `);
            console.log('✅ Added view_count column to pedia_articles');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ view_count column already exists in pedia_articles table');
            } else {
                throw error;
            }
        }

        // Update existing articles to have author_id (set to admin user)
        try {
            const [adminUsers] = await connection.execute(`
                SELECT id FROM users WHERE role = 'admin' LIMIT 1
            `);
            
            if (adminUsers.length > 0) {
                await connection.execute(`
                    UPDATE pedia_articles 
                    SET author_id = ? 
                    WHERE author_id IS NULL
                `, [adminUsers[0].id]);
                console.log('✅ Updated existing articles with author_id');
            }
        } catch (error) {
            console.log('⚠️ Could not update existing articles with author_id:', error.message);
        }

        console.log('✅ Pedia schema update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating pedia schema:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the update
updatePediaSchema(); 
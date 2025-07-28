const mysql = require('mysql2/promise');
const config = require('./config/database');

async function updateMultipleImages() {
    let connection;
    try {
        console.log('🔄 Menambahkan dukungan multiple images...');
        
        connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });

        // Create post_images table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS post_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                post_id INT NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                caption TEXT,
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        `;

        try {
            await connection.execute(createTableQuery);
            console.log('✅ Tabel post_images berhasil dibuat');
        } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('ℹ️ Tabel post_images sudah ada');
            } else {
                console.error(`❌ Error membuat tabel: ${error.message}`);
            }
        }

        // Add missing columns to posts table if not exists
        const alterQueries = [
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)",
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS activity_date DATE",
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS location VARCHAR(255)"
        ];

        for (const query of alterQueries) {
            try {
                await connection.execute(query);
                console.log(`✅ Kolom berhasil ditambahkan`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Kolom sudah ada`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
        }

        console.log('🎉 Dukungan multiple images berhasil ditambahkan!');
        console.log('📋 Fitur yang tersedia:');
        console.log('   - Upload foto utama (featured_image)');
        console.log('   - Upload multiple foto tambahan (activity_images)');
        console.log('   - Video kegiatan (opsional)');
        
    } catch (error) {
        console.error('❌ Error saat update:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateMultipleImages(); 
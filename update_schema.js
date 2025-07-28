const mysql = require('mysql2/promise');
const config = require('./config/database');

async function updateSchema() {
    let connection;
    try {
        console.log('🔄 Memperbarui schema database...');
        
        connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });

        // Add missing columns to courses table
        const alterQueries = [
            "ALTER TABLE courses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00",
            "ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration INT DEFAULT 0",
            "ALTER TABLE courses ADD COLUMN IF NOT EXISTS level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner'",
            "ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)"
        ];

        for (const query of alterQueries) {
            try {
                await connection.execute(query);
                console.log(`✅ ${query.split(' ')[2]} berhasil ditambahkan`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Kolom sudah ada: ${query.split(' ')[2]}`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
        }

        console.log('🎉 Schema database berhasil diperbarui!');
        
    } catch (error) {
        console.error('❌ Error saat memperbarui schema:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateSchema(); 
const mysql = require('mysql2/promise');
const config = require('./config/database');

async function updatePostsSchema() {
    let connection;
    try {
        console.log('🔄 Memperbarui schema tabel posts...');
        
        connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });

        // Add missing columns to posts table
        const alterQueries = [
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)",
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS activity_date DATE",
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS location VARCHAR(255)"
        ];

        for (const query of alterQueries) {
            try {
                await connection.execute(query);
                console.log(`✅ Kolom berhasil ditambahkan: ${query.split(' ')[2]}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Kolom sudah ada: ${query.split(' ')[2]}`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
        }

        // Update categories for activities
        const updateCategories = [
            "UPDATE categories SET name = 'Workshop & Pelatihan', description = 'Kategori untuk kegiatan workshop dan pelatihan' WHERE id = 1",
            "UPDATE categories SET name = 'Kelas Mengajar', description = 'Kategori untuk kegiatan mengajar di kelas' WHERE id = 2", 
            "UPDATE categories SET name = 'Seminar & Webinar', description = 'Kategori untuk kegiatan seminar dan webinar' WHERE id = 3",
            "UPDATE categories SET name = 'Kegiatan Siswa', description = 'Kategori untuk kegiatan yang melibatkan siswa' WHERE id = 4",
            "UPDATE categories SET name = 'Aktivitas Luar Kelas', description = 'Kategori untuk kegiatan di luar kelas' WHERE id = 5"
        ];

        for (const query of updateCategories) {
            try {
                await connection.execute(query);
                console.log(`✅ Kategori berhasil diupdate`);
            } catch (error) {
                console.error(`❌ Error update kategori: ${error.message}`);
            }
        }

        console.log('🎉 Schema tabel posts berhasil diperbarui!');
        
    } catch (error) {
        console.error('❌ Error saat memperbarui schema:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updatePostsSchema(); 
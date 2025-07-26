const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🚀 Memulai setup database...');
        
        // Koneksi ke MySQL tanpa database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });
        
        console.log('✅ Terhubung ke MySQL server');
        
        // Buat database jika belum ada
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database '${process.env.DB_NAME}' siap`);
        
        // Gunakan database
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        // Buat tabel users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                avatar VARCHAR(255) DEFAULT NULL,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabel users dibuat');
        
        // Buat tabel categories
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabel categories dibuat');
        
        // Buat tabel courses
        await connection.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                description TEXT,
                content LONGTEXT,
                thumbnail VARCHAR(255),
                category_id INT,
                instructor_id INT,
                is_published BOOLEAN DEFAULT FALSE,
                is_free BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Tabel courses dibuat');
        
        // Buat tabel posts
        await connection.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                content LONGTEXT,
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
        console.log('✅ Tabel posts dibuat');
        
        // Buat tabel pedia_articles
        await connection.query(`
            CREATE TABLE IF NOT EXISTS pedia_articles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                content LONGTEXT,
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
        console.log('✅ Tabel pedia_articles dibuat');
        
        // Insert default categories
        await connection.query(`
            INSERT IGNORE INTO categories (name, slug, description) VALUES 
            ('Teknologi', 'teknologi', 'Kategori untuk konten teknologi'),
            ('Pendidikan', 'pendidikan', 'Kategori untuk konten pendidikan'),
            ('Bisnis', 'bisnis', 'Kategori untuk konten bisnis'),
            ('Kesehatan', 'kesehatan', 'Kategori untuk konten kesehatan'),
            ('Seni & Budaya', 'seni-budaya', 'Kategori untuk konten seni dan budaya')
        `);
        console.log('✅ Kategori default ditambahkan');
        
        // Cek apakah admin user sudah ada
        const [adminUsers] = await connection.query(
            'SELECT * FROM users WHERE username = ?',
            ['admin']
        );
        
        if (adminUsers.length === 0) {
            // Buat admin user
            const hashedPassword = await bcrypt.hash('password', 10);
            await connection.query(`
                INSERT INTO users (username, email, password, full_name, role) VALUES 
                (?, ?, ?, ?, ?)
            `, ['admin', 'admin@byzantium.edu', hashedPassword, 'Administrator', 'admin']);
            console.log('✅ Admin user dibuat');
            console.log('📧 Email: admin@byzantium.edu');
            console.log('🔑 Password: password');
        } else {
            console.log('✅ Admin user sudah ada');
        }
        
        console.log('\n🎉 Setup database berhasil!');
        console.log('📋 Informasi login admin:');
        console.log('   Email: admin@byzantium.edu');
        console.log('   Password: password');
        console.log('\n🚀 Jalankan aplikasi dengan: npm run dev');
        
    } catch (error) {
        console.error('❌ Error setup database:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Pastikan MySQL server berjalan');
        console.log('   2. Periksa konfigurasi di config.env');
        console.log('   3. Pastikan user MySQL memiliki izin untuk membuat database');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase(); 
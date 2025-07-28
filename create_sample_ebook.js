const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSampleEbooks() {
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

        // Get admin user as author
        const [adminUsers] = await connection.execute(`
            SELECT id FROM users WHERE role = 'admin' LIMIT 1
        `);
        
        if (adminUsers.length === 0) {
            console.log('❌ No admin user found');
            return;
        }

        const authorId = adminUsers[0].id;

        // Sample ebooks data
        const sampleEbooks = [
            {
                title: 'Panduan Lengkap Belajar HTML & CSS',
                description: 'Ebook komprehensif untuk mempelajari HTML dan CSS dari dasar hingga mahir. Cocok untuk pemula yang ingin terjun ke dunia web development.',
                pdf_file: '/uploads/sample-html-css.pdf',
                category_id: 1, // Teknologi
                author_id: authorId,
                status: 'published'
            },
            {
                title: 'Strategi Marketing Digital untuk UMKM',
                description: 'Panduan praktis untuk mengembangkan strategi marketing digital yang efektif untuk usaha kecil dan menengah.',
                pdf_file: '/uploads/sample-marketing.pdf',
                category_id: 3, // Bisnis
                author_id: authorId,
                status: 'published'
            },
            {
                title: 'Panduan Kesehatan Mental di Era Digital',
                description: 'Ebook yang membahas pentingnya kesehatan mental dan cara menjaga keseimbangan hidup di era digital yang serba cepat.',
                pdf_file: '/uploads/sample-mental-health.pdf',
                category_id: 4, // Kesehatan
                author_id: authorId,
                status: 'published'
            },
            {
                title: 'Seni Fotografi untuk Pemula',
                description: 'Panduan lengkap fotografi untuk pemula, dari teknik dasar hingga tips menghasilkan foto yang menarik.',
                pdf_file: '/uploads/sample-photography.pdf',
                category_id: 5, // Seni & Budaya
                author_id: authorId,
                status: 'published'
            },
            {
                title: 'Metodologi Pembelajaran Efektif',
                description: 'Ebook yang membahas berbagai metode pembelajaran yang efektif untuk meningkatkan hasil belajar.',
                pdf_file: '/uploads/sample-learning.pdf',
                category_id: 2, // Pendidikan
                author_id: authorId,
                status: 'published'
            }
        ];

        // Insert sample ebooks
        for (const ebook of sampleEbooks) {
            // Generate slug from title
            const slug = ebook.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');

            await connection.execute(`
                INSERT INTO ebooks (title, slug, description, pdf_file, category_id, author_id, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                ebook.title,
                slug,
                ebook.description,
                ebook.pdf_file,
                ebook.category_id,
                ebook.author_id,
                ebook.status
            ]);

            console.log(`✅ Created ebook: ${ebook.title}`);
        }

        console.log('✅ All sample ebooks created successfully!');
        console.log('📚 You can now view ebooks at: /ebooks');
        
    } catch (error) {
        console.error('❌ Error creating sample ebooks:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the script
createSampleEbooks(); 
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSamplePedia() {
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

        // Create sample article
        const sampleArticle = {
            title: 'Panduan Lengkap Belajar JavaScript untuk Pemula',
            slug: 'panduan-lengkap-belajar-javascript-untuk-pemula',
            content: `
                <h2>Apa itu JavaScript?</h2>
                <p>JavaScript adalah bahasa pemrograman tingkat tinggi yang digunakan untuk membuat website interaktif. JavaScript pertama kali dikembangkan oleh Brendan Eich pada tahun 1995 untuk browser Netscape Navigator.</p>
                
                <h3>Mengapa Belajar JavaScript?</h3>
                <p>JavaScript adalah salah satu bahasa pemrograman yang paling populer di dunia. Berikut beberapa alasan mengapa Anda harus belajar JavaScript:</p>
                
                <ul>
                    <li><strong>Website Interaktif:</strong> JavaScript membuat website menjadi dinamis dan responsif</li>
                    <li><strong>Frontend Development:</strong> Digunakan untuk membuat user interface yang menarik</li>
                    <li><strong>Backend Development:</strong> Dengan Node.js, JavaScript bisa digunakan untuk server-side programming</li>
                    <li><strong>Mobile Apps:</strong> Framework seperti React Native menggunakan JavaScript</li>
                    <li><strong>Game Development:</strong> Banyak game browser dibuat dengan JavaScript</li>
                </ul>
                
                <h3>Dasar-dasar JavaScript</h3>
                <p>Mari kita mulai dengan konsep dasar JavaScript:</p>
                
                <h4>1. Variabel</h4>
                <p>Variabel digunakan untuk menyimpan data:</p>
                <pre><code>let nama = "John Doe";
const umur = 25;
var kota = "Jakarta";</code></pre>
                
                <h4>2. Tipe Data</h4>
                <p>JavaScript memiliki beberapa tipe data:</p>
                <ul>
                    <li><code>String</code> - Teks</li>
                    <li><code>Number</code> - Angka</li>
                    <li><code>Boolean</code> - True/False</li>
                    <li><code>Array</code> - Kumpulan data</li>
                    <li><code>Object</code> - Data kompleks</li>
                </ul>
                
                <h4>3. Fungsi</h4>
                <p>Fungsi adalah blok kode yang dapat dipanggil berulang kali:</p>
                <pre><code>function sapa(nama) {
    return "Halo, " + nama + "!";
}

console.log(sapa("Budi")); // Output: Halo, Budi!</code></pre>
                
                <h3>Contoh Program Sederhana</h3>
                <p>Berikut contoh program kalkulator sederhana:</p>
                <pre><code>function kalkulator(a, b, operasi) {
    switch(operasi) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return a / b;
        default:
            return "Operasi tidak valid";
    }
}

console.log(kalkulator(10, 5, '+')); // Output: 15
console.log(kalkulator(10, 5, '*')); // Output: 50</code></pre>
                
                <h3>Tips Belajar JavaScript</h3>
                <ol>
                    <li><strong>Mulai dari Dasar:</strong> Pelajari konsep dasar seperti variabel, fungsi, dan kontrol alur</li>
                    <li><strong>Praktik Terus:</strong> Buat proyek kecil untuk mengasah kemampuan</li>
                    <li><strong>Gunakan Console:</strong> Browser developer tools sangat membantu untuk debugging</li>
                    <li><strong>Baca Dokumentasi:</strong> MDN Web Docs adalah sumber terbaik untuk JavaScript</li>
                    <li><strong>Bergabung Komunitas:</strong> Ikuti forum dan grup belajar JavaScript</li>
                </ol>
                
                <blockquote>
                    <p>"The best way to learn JavaScript is to write JavaScript. Start with small projects and gradually build up to more complex applications."</p>
                </blockquote>
                
                <h3>Kesimpulan</h3>
                <p>JavaScript adalah bahasa pemrograman yang sangat powerful dan fleksibel. Dengan dedikasi dan praktik yang konsisten, Anda akan dapat menguasai JavaScript dan membuka banyak peluang karir di dunia teknologi.</p>
                
                <p>Selamat belajar JavaScript! 🚀</p>
            `,
            excerpt: 'Panduan lengkap untuk memulai belajar JavaScript dari nol hingga mahir. Cocok untuk pemula yang ingin terjun ke dunia web development.',
            featured_image: null,
            category_id: 1, // Teknologi
            author_id: authorId,
            status: 'published'
        };

        // Insert sample article
        await connection.execute(`
            INSERT INTO pedia_articles (title, slug, content, excerpt, featured_image, category_id, author_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sampleArticle.title,
            sampleArticle.slug,
            sampleArticle.content,
            sampleArticle.excerpt,
            sampleArticle.featured_image,
            sampleArticle.category_id,
            sampleArticle.author_id,
            sampleArticle.status
        ]);

        console.log('✅ Sample Pedia article created successfully!');
        console.log('📝 Article: ' + sampleArticle.title);
        console.log('🔗 URL: /pedia/' + sampleArticle.slug);
        
    } catch (error) {
        console.error('❌ Error creating sample article:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the script
createSamplePedia(); 
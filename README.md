# ByzantiumEdu - Platform Pembelajaran Online

ByzantiumEdu adalah platform pembelajaran online yang menyediakan kursus gratis dengan fitur blog dan ensiklopedia digital. Platform ini dibangun menggunakan Express.js dengan arsitektur MVC dan database MySQL.

## 🚀 Fitur Utama

### Untuk Pengguna
- **Kursus Gratis**: Akses ke berbagai kursus berkualitas tanpa biaya
- **Sistem Autentikasi**: Registrasi dan login yang aman
- **Blog**: Artikel informatif tentang pendidikan dan teknologi
- **Pedia**: Ensiklopedia digital dengan konten edukatif
- **Dashboard Pengguna**: Melihat progress kursus dan profil

### Untuk Admin
- **Dashboard Admin**: Statistik dan overview platform
- **Manajemen Kursus**: CRUD operasi untuk kursus
- **Manajemen Postingan**: CRUD operasi untuk blog
- **Manajemen Pedia**: CRUD operasi untuk artikel ensiklopedia
- **Manajemen Pengguna**: Kelola data pengguna

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MySQL**: Database management system
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **multer**: File upload handling
- **express-validator**: Form validation

### Frontend
- **EJS**: Template engine
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icon library
- **Vanilla JavaScript**: Interactive features

## 📋 Prasyarat

Sebelum menjalankan project ini, pastikan Anda telah menginstall:

- Node.js (versi 14 atau lebih baru)
- MySQL (versi 8.0 atau lebih baru)
- npm atau yarn

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/byzantium-edu.git
cd byzantium-edu
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Database
1. Buat database MySQL baru:
```sql
CREATE DATABASE byzantium_edu;
```

2. Import schema database:
```bash
mysql -u root -p byzantium_edu < database/schema.sql
```

### 4. Konfigurasi Environment
1. Copy file config.env.example ke config.env:
```bash
cp config.env.example config.env
```

2. Edit file `config.env` sesuai dengan konfigurasi database Anda:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=byzantium_edu
DB_PORT=3306
SESSION_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

### 5. Buat Direktori Uploads
```bash
mkdir -p public/uploads
```

### 6. Jalankan Aplikasi
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
byzantium-edu/
├── config/
│   └── database.js          # Konfigurasi database
├── database/
│   └── schema.sql           # Schema database
├── middleware/
│   └── auth.js              # Middleware autentikasi
├── models/
│   ├── User.js              # Model user
│   ├── Course.js            # Model course
│   ├── Post.js              # Model post
│   └── Pedia.js             # Model pedia
├── public/
│   ├── css/
│   │   └── style.css        # Custom CSS
│   ├── js/
│   │   └── script.js        # Custom JavaScript
│   └── uploads/             # File uploads
├── routes/
│   ├── auth.js              # Routes autentikasi
│   ├── home.js              # Routes homepage
│   ├── courses.js           # Routes courses
│   ├── posts.js             # Routes posts
│   ├── pedia.js             # Routes pedia
│   └── admin.js             # Routes admin
├── views/
│   ├── layouts/
│   │   └── main.ejs         # Layout utama
│   ├── auth/
│   │   ├── login.ejs        # Halaman login
│   │   └── register.ejs     # Halaman register
│   ├── home/
│   │   └── index.ejs        # Halaman beranda
│   └── ...                  # View lainnya
├── app.js                   # Entry point aplikasi
├── package.json             # Dependencies
├── config.env               # Environment variables
└── README.md               # Dokumentasi
```

## 🔐 Default Admin Account

Setelah menjalankan schema database, Anda dapat login sebagai admin dengan:

- **Email**: admin@byzantium.edu
- **Password**: password

## 📚 API Endpoints

### Authentication
- `GET /auth` - Menampilkan form login/register
- `POST /auth` - Proses login/register
- `GET /auth/logout` - Logout

### Courses
- `GET /courses` - Daftar semua kursus
- `GET /courses/:slug` - Detail kursus
- `POST /courses/:id/enroll` - Daftar ke kursus
- `GET /courses/search` - Pencarian kursus

### Posts
- `GET /posts` - Daftar semua postingan
- `GET /posts/:slug` - Detail postingan
- `GET /posts/search` - Pencarian postingan

### Pedia
- `GET /pedia` - Daftar semua artikel
- `GET /pedia/:slug` - Detail artikel
- `GET /pedia/search` - Pencarian artikel

### Admin
- `GET /admin` - Dashboard admin
- `GET /admin/courses` - Manajemen kursus
- `GET /admin/posts` - Manajemen postingan
- `GET /admin/users` - Manajemen pengguna

## 🎨 Customization

### Mengubah Tema
1. Edit file `public/css/style.css`
2. Modifikasi variabel CSS untuk warna dan font
3. Sesuaikan komponen Bootstrap sesuai kebutuhan

### Menambah Fitur Baru
1. Buat model baru di folder `models/`
2. Buat route baru di folder `routes/`
3. Buat view baru di folder `views/`
4. Update middleware jika diperlukan

## 🔧 Development

### Menjalankan dalam Mode Development
```bash
npm run dev
```

### Menjalankan Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables untuk Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
SESSION_SECRET=your_secure_session_secret
```

## 🤝 Contributing

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Support

Jika Anda memiliki pertanyaan atau masalah, silakan:

1. Buat issue di GitHub
2. Hubungi tim development
3. Konsultasi dokumentasi

## 🙏 Acknowledgments

- Bootstrap untuk framework CSS
- Font Awesome untuk icon
- Express.js community
- MySQL community

---

**ByzantiumEdu** - Membuat pendidikan lebih mudah diakses untuk semua orang. 
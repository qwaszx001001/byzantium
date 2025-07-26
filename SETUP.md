# Panduan Setup ByzantiumEdu

## 🚀 Langkah-langkah Instalasi

### 1. Prasyarat
Pastikan Anda telah menginstall:
- Node.js (versi 14 atau lebih baru)
- MySQL (versi 8.0 atau lebih baru)
- npm atau yarn

### 2. Setup Database

#### A. Buat Database MySQL
```sql
CREATE DATABASE byzantium_edu;
```

#### B. Import Schema Database
```bash
mysql -u root -p byzantium_edu < database/schema.sql
```

### 3. Konfigurasi Environment

#### A. Edit file `config.env`
Sesuaikan dengan konfigurasi database Anda:
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

### 4. Install Dependencies
```bash
npm install
```

### 5. Jalankan Aplikasi

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔐 Default Admin Account

Setelah menjalankan schema database, Anda dapat login sebagai admin dengan:
- **Email**: admin@byzantium.edu
- **Password**: password

## 📁 Struktur File Penting

```
byzantium-edu/
├── app.js                 # Entry point aplikasi
├── config.env             # Environment variables
├── package.json           # Dependencies
├── database/
│   └── schema.sql        # Schema database
├── config/
│   └── database.js       # Konfigurasi database
├── models/               # Model database
├── routes/               # Route handlers
├── views/                # Template EJS
├── public/               # Static files
└── middleware/           # Middleware
```

## 🛠️ Troubleshooting

### Masalah Koneksi Database
1. Pastikan MySQL berjalan
2. Periksa konfigurasi di `config.env`
3. Pastikan database `byzantium_edu` sudah dibuat

### Masalah Port
Jika port 3000 sudah digunakan, ubah di `config.env`:
```env
PORT=3001
```

### Masalah Dependencies
Jika ada masalah dengan dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Fitur yang Tersedia

### Untuk Pengguna
- ✅ Registrasi dan Login
- ✅ Melihat daftar kursus
- ✅ Mendaftar ke kursus
- ✅ Membaca blog/postingan
- ✅ Mengakses pedia/ensiklopedia

### Untuk Admin
- ✅ Dashboard admin
- ✅ Manajemen kursus (CRUD)
- ✅ Manajemen postingan (CRUD)
- ✅ Manajemen pengguna
- ✅ Upload file gambar

## 🔧 Development

### Menambah Fitur Baru
1. Buat model di `models/`
2. Buat route di `routes/`
3. Buat view di `views/`
4. Update middleware jika diperlukan

### Menambah Halaman Baru
1. Buat route di file routes yang sesuai
2. Buat view EJS di folder views
3. Update navigation jika diperlukan

## 📦 Deployment

### Production Environment
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=your_production_db
SESSION_SECRET=your_secure_secret
```

### Build untuk Production
```bash
npm run build
```

## 🐛 Debug

### Log Aplikasi
Aplikasi akan menampilkan log di console:
- Koneksi database
- Error handling
- Request logging

### Database Debug
Untuk debug database, tambahkan di `config/database.js`:
```javascript
console.log('Query:', sql);
console.log('Parameters:', params);
```

## 📞 Support

Jika mengalami masalah:
1. Periksa log error di console
2. Pastikan semua prasyarat terpenuhi
3. Periksa konfigurasi database
4. Restart aplikasi jika diperlukan

---

**ByzantiumEdu** - Platform pembelajaran online yang mudah diakses untuk semua orang. 
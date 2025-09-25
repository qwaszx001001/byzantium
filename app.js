const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3091;

// Database connection
const db = require('./config/database');

// Session store options
const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000, // 24 hours
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(options);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://cdn.jsdelivr.net", 
                "https://cdnjs.cloudflare.com", 
                "https://fonts.googleapis.com"
            ],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "'unsafe-eval'",
                "https://cdn.jsdelivr.net", 
                "https://cdnjs.cloudflare.com",
                "https://static.cloudflareinsights.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            fontSrc: [
                "'self'", 
                "https://cdnjs.cloudflare.com", 
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:",
                "http:",
                "blob:"
            ],
            connectSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://static.cloudflareinsights.com"
            ],
            frameSrc: [
                "'self'", 
                "https://www.youtube.com", 
                "https://youtube.com", 
                "https://www.youtube-nocookie.com", 
                "https://youtu.be"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    key: 'byzantium_session',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true only if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
    // Debug session
    console.log('Session middleware:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user,
        isAuthenticated: !!req.session?.user
    });

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session?.user || null;
    res.locals.isAuthenticated = !!req.session?.user;
    res.locals.isAdmin = req.session?.user?.role === 'admin';
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const postRoutes = require('./routes/posts');
const pediaRoutes = require('./routes/pedia');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const enrollmentRoutes = require('./routes/enrollment');
const ebookRoutes = require('./routes/ebooks');
const byzanpediaRoutes = require('./routes/byzanpedia');

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/posts', postRoutes);
app.use('/pedia', pediaRoutes);
app.use('/admin', adminRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/ebooks', ebookRoutes);
app.use('/byzanpedia', byzanpediaRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('error/404', { 
        title: 'Halaman Tidak Ditemukan',
        user: req.session.user 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error/500', { 
        title: 'Terjadi Kesalahan',
        user: req.session.user 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app; 
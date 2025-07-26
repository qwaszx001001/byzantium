const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { isAdmin } = require('../middleware/auth');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Pedia = require('../models/Pedia');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalCourses = await Course.count();
        const totalPosts = await Post.count();
        const totalPedia = await Pedia.count();
        
        const recentCourses = await Course.getAll(5, 0);
        const recentPosts = await Post.getAll(5, 0);
        const recentUsers = await User.getAll(5, 0);
        
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - ByzantiumEdu',
            stats: {
                totalUsers,
                totalCourses,
                totalPosts,
                totalPedia
            },
            recentCourses,
            recentPosts,
            recentUsers
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - ByzantiumEdu',
            stats: { totalUsers: 0, totalCourses: 0, totalPosts: 0, totalPedia: 0 },
            recentCourses: [],
            recentPosts: [],
            recentUsers: []
        });
    }
});

// Course management
router.get('/courses', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const courses = await Course.getAll(limit, offset);
        const totalCourses = await Course.count();
        const totalPages = Math.ceil(totalCourses / limit);
        
        res.render('admin/courses/index', {
            title: 'Kelola Kursus - ByzantiumEdu',
            courses,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin courses error:', error);
        res.render('admin/courses/index', {
            title: 'Kelola Kursus - ByzantiumEdu',
            courses: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Create course page
router.get('/courses/create', isAdmin, (req, res) => {
    res.render('admin/courses/create', {
        title: 'Tambah Kursus - ByzantiumEdu'
    });
});

// Create course process
router.post('/courses/create', isAdmin, upload.single('thumbnail'), async (req, res) => {
    try {
        console.log('Create course route hit');
        console.log('Form data:', req.body);
        
        // Simple validation
        if (!req.body.title || req.body.title.trim() === '') {
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Judul harus diisi' }]
            });
        }
        
        if (!req.body.slug || req.body.slug.trim() === '') {
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Slug harus diisi' }]
            });
        }
        
        if (!req.body.description || req.body.description.trim() === '') {
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Deskripsi harus diisi' }]
            });
        }
        
        if (!req.body.content || req.body.content.trim() === '') {
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Konten harus diisi' }]
            });
        }

        const courseData = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
            category_id: req.body.category_id || null,
            instructor_id: req.session.user.id,
            status: req.body.status || 'draft',
            price: req.body.price || 0,
            duration: req.body.duration || 0,
            level: req.body.level || 'beginner'
        };

        console.log('Creating course with data:', courseData);
        const courseId = await Course.create(courseData);
        console.log('Course created with ID:', courseId);
        
        req.flash('success_msg', 'Kursus berhasil ditambahkan');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Create course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah kursus');
        res.redirect('/admin/courses/create');
    }
});

// Edit course page
router.get('/courses/:id/edit', isAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error_msg', 'Kursus tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        res.render('admin/courses/edit', {
            title: 'Edit Kursus - ByzantiumEdu',
            course
        });
    } catch (error) {
        console.error('Edit course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
});

// Update course
router.post('/courses/:id/edit', isAdmin, upload.single('thumbnail'), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category_id: req.body.category_id || null,
            is_published: req.body.is_published === 'on',
            is_free: req.body.is_free === 'on'
        };

        if (req.file) {
            updateData.thumbnail = `/uploads/${req.file.filename}`;
        }

        await Course.update(id, updateData);
        req.flash('success_msg', 'Kursus berhasil diperbarui');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Update course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui kursus');
        res.redirect('/admin/courses');
    }
});

// Delete course
router.post('/courses/:id/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Course.delete(id);
        req.flash('success_msg', 'Kursus berhasil dihapus');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Delete course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus kursus');
        res.redirect('/admin/courses');
    }
});

// Post management
router.get('/posts', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const posts = await Post.getAll(limit, offset);
        const totalPosts = await Post.count();
        const totalPages = Math.ceil(totalPosts / limit);
        
        res.render('admin/posts/index', {
            title: 'Kelola Postingan - ByzantiumEdu',
            posts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin posts error:', error);
        res.render('admin/posts/index', {
            title: 'Kelola Postingan - ByzantiumEdu',
            posts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Create post page
router.get('/posts/create', isAdmin, (req, res) => {
    res.render('admin/posts/create', {
        title: 'Tambah Postingan - ByzantiumEdu'
    });
});

// Create post process
router.post('/posts/create', isAdmin, upload.single('featured_image'), [
    body('title').notEmpty().withMessage('Judul harus diisi'),
    body('slug').notEmpty().withMessage('Slug harus diisi'),
    body('content').notEmpty().withMessage('Konten harus diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/posts/create', {
                title: 'Tambah Postingan - ByzantiumEdu',
                errors: errors.array(),
                oldData: req.body
            });
        }

        const postData = {
            title: req.body.title,
            slug: req.body.slug,
            content: req.body.content,
            excerpt: req.body.excerpt,
            featured_image: req.file ? `/uploads/${req.file.filename}` : null,
            category_id: req.body.category_id || null,
            author_id: req.session.user.id,
            status: req.body.status || 'draft'
        };

        await Post.create(postData);
        req.flash('success_msg', 'Postingan berhasil ditambahkan');
        res.redirect('/admin/posts');
    } catch (error) {
        console.error('Create post error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah postingan');
        res.redirect('/admin/posts/create');
    }
});

// User management
router.get('/users', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const users = await User.getAll(limit, offset);
        const totalUsers = await User.count();
        const totalPages = Math.ceil(totalUsers / limit);
        
        res.render('admin/users/index', {
            title: 'Kelola Pengguna - ByzantiumEdu',
            users,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.render('admin/users/index', {
            title: 'Kelola Pengguna - ByzantiumEdu',
            users: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

module.exports = router; 
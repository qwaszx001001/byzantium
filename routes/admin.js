const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { isAdmin } = require('../middleware/auth');
const Course = require('../models/Course');
const CourseModule = require('../models/CourseModule');
const CourseLesson = require('../models/CourseLesson');
const Post = require('../models/Post');
const PostImage = require('../models/PostImage');
const Pedia = require('../models/Pedia');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Ebook = require('../models/Ebook');

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

// PDF upload configuration
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const pdfUpload = multer({
    storage: pdfStorage,
    limits: { fileSize: 10000000 }, // 10MB for PDFs
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype === 'application/pdf';
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: PDF files only!');
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
        const totalInstructors = await Instructor.count();
        const totalEbooks = await Ebook.count(true); // Include drafts for admin
        
        const recentCourses = await Course.getAll(5, 0);
        const recentPosts = await Post.getAll(5, 0);
        const recentUsers = await User.getAll(5, 0);
        
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - ByzantiumEdu',
            stats: {
                totalUsers,
                totalCourses,
                totalPosts,
                totalPedia,
                totalInstructors,
                totalEbooks
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
router.get('/courses/create', isAdmin, async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0); // Get all instructors
        res.render('admin/courses/create', {
            title: 'Tambah Kursus - ByzantiumEdu',
            instructors
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/courses/create', {
            title: 'Tambah Kursus - ByzantiumEdu',
            instructors: []
        });
    }
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
            title: 'Kelola Kegiatan - ByzantiumEdu',
            posts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            query: req.query,
            categories: [
                { id: 1, name: 'Workshop & Pelatihan' },
                { id: 2, name: 'Kelas Mengajar' },
                { id: 3, name: 'Seminar & Webinar' },
                { id: 4, name: 'Kegiatan Siswa' },
                { id: 5, name: 'Aktivitas Luar Kelas' }
            ]
        });
    } catch (error) {
        console.error('Admin posts error:', error);
        res.render('admin/posts/index', {
            title: 'Kelola Kegiatan - ByzantiumEdu',
            posts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: {},
            categories: []
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
router.post('/posts/create', isAdmin, upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'activity_images', maxCount: 10 }
]), [
    body('title').notEmpty().withMessage('Judul kegiatan harus diisi'),
    body('content').notEmpty().withMessage('Detail kegiatan harus diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/posts/create', {
                title: 'Tambah Kegiatan - ByzantiumEdu',
                errors: errors.array(),
                oldData: req.body
            });
        }

        // Generate slug from title if not provided
        let slug = req.body.slug;
        if (!slug) {
            slug = req.body.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        const postData = {
            title: req.body.title,
            slug: slug,
            content: req.body.content,
            excerpt: req.body.excerpt,
            featured_image: req.files.featured_image ? `/uploads/${req.files.featured_image[0].filename}` : null,
            video_url: req.body.video_url || null,
            category_id: req.body.category_id || null,
            author_id: req.session.user.id,
            status: req.body.status || 'draft',
            activity_date: req.body.activity_date || null,
            location: req.body.location || null
        };

        const postId = await Post.create(postData);

        // Handle multiple activity images
        if (req.files.activity_images) {
            for (let i = 0; i < req.files.activity_images.length; i++) {
                const file = req.files.activity_images[i];
                await PostImage.create({
                    post_id: postId,
                    image_path: `/uploads/${file.filename}`,
                    order_index: i
                });
            }
        }

        req.flash('success_msg', 'Kegiatan berhasil ditambahkan');
        res.redirect('/admin/posts');
    } catch (error) {
        console.error('Create post error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah kegiatan');
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

// Course Modules Management
router.get('/courses/:id/modules', isAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error_msg', 'Kursus tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const modules = await CourseModule.getByCourseId(req.params.id);
        
        res.render('admin/courses/modules', {
            title: 'Kelola Modul Kursus - ByzantiumEdu',
            course,
            modules
        });
    } catch (error) {
        console.error('Course modules error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
});

// Create module
router.post('/courses/:id/modules', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const moduleData = {
            course_id: id,
            title: req.body.title,
            description: req.body.description,
            order_index: req.body.order_index || 0
        };
        
        await CourseModule.create(moduleData);
        req.flash('success_msg', 'Modul berhasil ditambahkan');
        res.redirect(`/admin/courses/${id}/modules`);
    } catch (error) {
        console.error('Create module error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah modul');
        res.redirect(`/admin/courses/${req.params.id}/modules`);
    }
});

// Course Lessons Management
router.get('/modules/:id/lessons', isAdmin, async (req, res) => {
    try {
        const module = await CourseModule.findById(req.params.id);
        if (!module) {
            req.flash('error_msg', 'Modul tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const course = await Course.findById(module.course_id);
        const lessons = await CourseLesson.getByModuleId(req.params.id);
        
        res.render('admin/courses/lessons', {
            title: 'Kelola Lesson Kursus - ByzantiumEdu',
            course,
            module,
            lessons
        });
    } catch (error) {
        console.error('Course lessons error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
});

// Create lesson
router.post('/modules/:id/lessons', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const lessonData = {
            module_id: id,
            title: req.body.title,
            content: req.body.content,
            video_url: req.body.video_url,
            duration: req.body.duration || 0,
            order_index: req.body.order_index || 0
        };
        
        await CourseLesson.create(lessonData);
        req.flash('success_msg', 'Lesson berhasil ditambahkan');
        res.redirect(`/admin/modules/${id}/lessons`);
    } catch (error) {
        console.error('Create lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah lesson');
        res.redirect(`/admin/modules/${req.params.id}/lessons`);
    }
});

// Edit lesson page
router.get('/lessons/:id/edit', isAdmin, async (req, res) => {
    try {
        const lesson = await CourseLesson.findById(req.params.id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const module = await CourseModule.findById(lesson.module_id);
        const course = await Course.findById(module.course_id);
        
        res.render('admin/courses/edit-lesson', {
            title: 'Edit Lesson - ByzantiumEdu',
            lesson,
            module,
            course
        });
    } catch (error) {
        console.error('Edit lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
});

// Update lesson
router.post('/lessons/:id/edit', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await CourseLesson.findById(id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const updateData = {
            title: req.body.title,
            content: req.body.content,
            video_url: req.body.video_url,
            duration: req.body.duration || 0,
            order_index: req.body.order_index || 0
        };
        
        await CourseLesson.update(id, updateData);
        req.flash('success_msg', 'Lesson berhasil diperbarui');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    } catch (error) {
        console.error('Update lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui lesson');
        res.redirect(`/admin/lessons/${req.params.id}/edit`);
    }
});

// Delete lesson
router.post('/lessons/:id/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await CourseLesson.findById(id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        await CourseLesson.delete(id);
        req.flash('success_msg', 'Lesson berhasil dihapus');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    } catch (error) {
        console.error('Delete lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus lesson');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    }
});

// Instructor Management
router.get('/instructors', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const instructors = await Instructor.getAll(limit, offset);
        const totalInstructors = await Instructor.count();
        const totalPages = Math.ceil(totalInstructors / limit);
        
        res.render('admin/instructors/index', {
            title: 'Kelola Instruktur - ByzantiumEdu',
            instructors,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin instructors error:', error);
        res.render('admin/instructors/index', {
            title: 'Kelola Instruktur - ByzantiumEdu',
            instructors: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Create instructor page
router.get('/instructors/create', isAdmin, (req, res) => {
    res.render('admin/instructors/create', {
        title: 'Tambah Instruktur - ByzantiumEdu'
    });
});

// Create instructor process
router.post('/instructors/create', isAdmin, upload.single('avatar'), [
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('email').isEmail().withMessage('Email harus valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('full_name').notEmpty().withMessage('Nama lengkap harus diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/instructors/create');
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const instructorData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            full_name: req.body.full_name,
            bio: req.body.bio || '',
            avatar: req.file ? `/uploads/${req.file.filename}` : null
        };
        
        await Instructor.create(instructorData);
        req.flash('success_msg', 'Instruktur berhasil ditambahkan');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Create instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah instruktur');
        res.redirect('/admin/instructors/create');
    }
});

// Edit instructor page
router.get('/instructors/:id/edit', isAdmin, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        res.render('admin/instructors/edit', {
            title: 'Edit Instruktur - ByzantiumEdu',
            instructor
        });
    } catch (error) {
        console.error('Edit instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/instructors');
    }
});

// Update instructor
router.post('/instructors/:id/edit', isAdmin, upload.single('avatar'), async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await Instructor.findById(id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        const updateData = {
            username: req.body.username,
            email: req.body.email,
            full_name: req.body.full_name,
            bio: req.body.bio || '',
            avatar: req.file ? `/uploads/${req.file.filename}` : instructor.avatar
        };
        
        await Instructor.update(id, updateData);
        req.flash('success_msg', 'Instruktur berhasil diperbarui');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Update instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui instruktur');
        res.redirect(`/admin/instructors/${req.params.id}/edit`);
    }
});

// Delete instructor
router.post('/instructors/:id/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Instructor.delete(id);
        if (!success) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        req.flash('success_msg', 'Instruktur berhasil dihapus');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Delete instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus instruktur');
        res.redirect('/admin/instructors');
    }
});

// View instructor detail
router.get('/instructors/:id', isAdmin, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        const courses = await Instructor.getCourses(req.params.id, 10, 0);
        
        res.render('admin/instructors/detail', {
            title: `${instructor.full_name} - Detail Instruktur - ByzantiumEdu`,
            instructor,
            courses
        });
    } catch (error) {
        console.error('Instructor detail error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/instructors');
    }
});

// Pedia Management
router.get('/pedia', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const articles = await Pedia.getAll(limit, offset);
        const totalArticles = await Pedia.count();
        const totalPages = Math.ceil(totalArticles / limit);
        
        res.render('admin/pedia/index', {
            title: 'Kelola Artikel Pedia - ByzantiumEdu',
            articles,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin pedia error:', error);
        res.render('admin/pedia/index', {
            title: 'Kelola Artikel Pedia - ByzantiumEdu',
            articles: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Create pedia page
router.get('/pedia/create', isAdmin, async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0); // Get all instructors
        res.render('admin/pedia/create', {
            title: 'Tambah Artikel Pedia - ByzantiumEdu',
            instructors
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/pedia/create', {
            title: 'Tambah Artikel Pedia - ByzantiumEdu',
            instructors: []
        });
    }
});

// Create pedia process
router.post('/pedia/create', isAdmin, upload.single('featured_image'), [
    body('title').notEmpty().withMessage('Judul harus diisi'),
    body('slug').notEmpty().withMessage('Slug harus diisi'),
    body('content').notEmpty().withMessage('Konten harus diisi'),
    body('author_id').notEmpty().withMessage('Penulis harus dipilih')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/pedia/create');
        }

        const pediaData = {
            title: req.body.title,
            slug: req.body.slug,
            content: req.body.content,
            excerpt: req.body.excerpt || '',
            featured_image: req.file ? `/uploads/${req.file.filename}` : null,
            category_id: req.body.category_id || null,
            author_id: req.body.author_id,
            status: req.body.status || 'draft'
        };
        
        await Pedia.create(pediaData);
        req.flash('success_msg', 'Artikel Pedia berhasil ditambahkan');
        res.redirect('/admin/pedia');
    } catch (error) {
        console.error('Create pedia error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah artikel');
        res.redirect('/admin/pedia/create');
    }
});

// Ebook Management
router.get('/ebooks', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const ebooks = await Ebook.getAll(limit, offset, true); // Include drafts for admin
        const totalEbooks = await Ebook.count(true); // Include drafts for admin
        const totalPages = Math.ceil(totalEbooks / limit);
        
        res.render('admin/ebooks/index', {
            title: 'Kelola Ebook - ByzantiumEdu',
            ebooks,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Admin ebooks error:', error);
        res.render('admin/ebooks/index', {
            title: 'Kelola Ebook - ByzantiumEdu',
            ebooks: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Create ebook page
router.get('/ebooks/create', isAdmin, async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0);
        res.render('admin/ebooks/create', {
            title: 'Tambah Ebook - ByzantiumEdu',
            instructors
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/ebooks/create', {
            title: 'Tambah Ebook - ByzantiumEdu',
            instructors: []
        });
    }
});

// Create ebook process
router.post('/ebooks/create', isAdmin, pdfUpload.single('pdf_file'), [
    body('title').notEmpty().withMessage('Judul ebook harus diisi'),
    body('description').notEmpty().withMessage('Deskripsi harus diisi'),
    body('author_id').notEmpty().withMessage('Penulis harus dipilih')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/ebooks/create');
        }

        if (!req.file) {
            req.flash('error_msg', 'File PDF harus diupload');
            return res.redirect('/admin/ebooks/create');
        }

        const ebookData = {
            title: req.body.title,
            description: req.body.description,
            pdf_file: `/uploads/${req.file.filename}`,
            category_id: req.body.category_id || null,
            author_id: req.body.author_id,
            status: req.body.status || 'published'
        };
        
        await Ebook.create(ebookData);
        req.flash('success_msg', 'Ebook berhasil ditambahkan');
        res.redirect('/admin/ebooks');
    } catch (error) {
        console.error('Create ebook error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah ebook');
        res.redirect('/admin/ebooks/create');
    }
});

// Delete ebook
router.post('/ebooks/:id/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Ebook.delete(id);
        req.flash('success_msg', 'Ebook berhasil dihapus');
        res.redirect('/admin/ebooks');
    } catch (error) {
        console.error('Delete ebook error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus ebook');
        res.redirect('/admin/ebooks');
    }
});

module.exports = router; 
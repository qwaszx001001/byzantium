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
const { 
    getAdminDashboard, 
    getAllUsers, 
    getUserById,
    getAllCourses,
    getCreateCourse,
    createCourse,
    getEditCourse,
    updateCourse,
    deleteCourse,
    getAllPosts,
    getCreatePost,
    createPost,
    getAllInstructors,
    getCreateInstructor,
    createInstructor,
    getEditInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorDetail,
    getAllPediaArticles,
    getCreatePediaArticle,
    createPediaArticle,
    getAllEbooks,
    getCreateEbook,
    createEbook,
    deleteEbook,
    getCourseModules,
    createCourseModule,
    getCourseLessons,
    createCourseLesson,
    getEditLesson,
    updateLesson,
    deleteLesson
} = require('../controllers/adminController');

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
router.get('/', isAdmin, getAdminDashboard);

// Course management
router.get('/courses', isAdmin, getAllCourses);

// Create course page
router.get('/courses/create', isAdmin, getCreateCourse);

// Create course process
router.post('/courses/create', isAdmin, upload.single('thumbnail'), createCourse);

// Edit course page
router.get('/courses/:id/edit', isAdmin, getEditCourse);

// Update course
router.post('/courses/:id/edit', isAdmin, upload.single('thumbnail'), updateCourse);

// Delete course
router.post('/courses/:id/delete', isAdmin, deleteCourse);

// Post management
router.get('/posts', isAdmin, getAllPosts);

// Create post page
router.get('/posts/create', isAdmin, getCreatePost);

// Create post process
router.post('/posts/create', isAdmin, upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'activity_images', maxCount: 10 }
]), [
    body('title').notEmpty().withMessage('Judul kegiatan harus diisi'),
    body('content').notEmpty().withMessage('Detail kegiatan harus diisi')
], createPost);

// User management
router.get('/users', isAdmin, getAllUsers);

// User detail
router.get('/users/:id', isAdmin, getUserById);

// Course Modules Management
router.get('/courses/:id/modules', isAdmin, getCourseModules);

// Create module
router.post('/courses/:id/modules', isAdmin, createCourseModule);

// Course Lessons Management
router.get('/modules/:id/lessons', isAdmin, getCourseLessons);

// Create lesson
router.post('/modules/:id/lessons', isAdmin, createCourseLesson);

// Edit lesson page
router.get('/lessons/:id/edit', isAdmin, getEditLesson);

// Update lesson
router.post('/lessons/:id/edit', isAdmin, updateLesson);

// Delete lesson
router.post('/lessons/:id/delete', isAdmin, deleteLesson);

// Instructor Management
router.get('/instructors', isAdmin, getAllInstructors);

// Create instructor page
router.get('/instructors/create', isAdmin, getCreateInstructor);

// Create instructor process
router.post('/instructors/create', isAdmin, upload.single('avatar'), [
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('email').isEmail().withMessage('Email harus valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('full_name').notEmpty().withMessage('Nama lengkap harus diisi')
], createInstructor);

// Edit instructor page
router.get('/instructors/:id/edit', isAdmin, getEditInstructor);

// Update instructor
router.post('/instructors/:id/edit', isAdmin, upload.single('avatar'), updateInstructor);

// Delete instructor
router.post('/instructors/:id/delete', isAdmin, deleteInstructor);

// View instructor detail
router.get('/instructors/:id', isAdmin, getInstructorDetail);

// Pedia Management
router.get('/pedia', isAdmin, getAllPediaArticles);

// Create pedia page
router.get('/pedia/create', isAdmin, getCreatePediaArticle);

// Create pedia process
router.post('/pedia/create', isAdmin, upload.single('featured_image'), [
    body('title').notEmpty().withMessage('Judul harus diisi'),
    body('slug').notEmpty().withMessage('Slug harus diisi'),
    body('content').notEmpty().withMessage('Konten harus diisi'),
    body('author_id').notEmpty().withMessage('Penulis harus dipilih')
], createPediaArticle);

// Ebook Management
router.get('/ebooks', isAdmin, getAllEbooks);

// Create ebook page
router.get('/ebooks/create', isAdmin, getCreateEbook);

// Create ebook process
router.post('/ebooks/create', isAdmin, pdfUpload.single('pdf_file'), [
    body('title').notEmpty().withMessage('Judul ebook harus diisi'),
    body('description').notEmpty().withMessage('Deskripsi harus diisi'),
    body('author_id').notEmpty().withMessage('Penulis harus dipilih')
], createEbook);

// Delete ebook
router.post('/ebooks/:id/delete', isAdmin, deleteEbook);

module.exports = router;
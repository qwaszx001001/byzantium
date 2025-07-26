const express = require('express');
const Course = require('../models/Course');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// All courses page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const courses = await Course.getAllPublished(limit, offset);
        const totalCourses = await Course.countPublished();
        const totalPages = Math.ceil(totalCourses / limit);
        
        res.render('courses/index', {
            title: 'Semua Kursus - ByzantiumEdu',
            courses,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error('Courses page error:', error);
        res.render('courses/index', {
            title: 'Semua Kursus - ByzantiumEdu',
            courses: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Course detail page
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await Course.findBySlug(slug);
        
        if (!course) {
            return res.status(404).render('error/404', {
                title: 'Kursus Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        res.render('courses/detail', {
            title: `${course.title} - ByzantiumEdu`,
            course
        });
    } catch (error) {
        console.error('Course detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
});

// Enroll in course
router.post('/:id/enroll', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;
        
        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            req.flash('error_msg', 'Kursus tidak ditemukan');
            return res.redirect('/courses');
        }
        
        // Check if already enrolled
        const db = require('../config/database');
        const [existingEnrollment] = await db.execute(
            'SELECT * FROM user_course_enrollments WHERE user_id = ? AND course_id = ?',
            [userId, id]
        );
        
        if (existingEnrollment.length > 0) {
            req.flash('error_msg', 'Anda sudah terdaftar di kursus ini');
            return res.redirect(`/courses/${course.slug}`);
        }
        
        // Enroll user
        await db.execute(
            'INSERT INTO user_course_enrollments (user_id, course_id) VALUES (?, ?)',
            [userId, id]
        );
        
        req.flash('success_msg', 'Berhasil mendaftar ke kursus!');
        res.redirect(`/courses/${course.slug}`);
    } catch (error) {
        console.error('Enroll error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat mendaftar');
        res.redirect('/courses');
    }
});

// Search courses
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/courses');
        }
        
        const courses = await Course.search(q, 20);
        
        res.render('courses/search', {
            title: `Hasil Pencarian: ${q} - ByzantiumEdu`,
            courses,
            query: q
        });
    } catch (error) {
        console.error('Course search error:', error);
        res.render('courses/search', {
            title: 'Pencarian Kursus - ByzantiumEdu',
            courses: [],
            query: req.query.q || ''
        });
    }
});

module.exports = router; 
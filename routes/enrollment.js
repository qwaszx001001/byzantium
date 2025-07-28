const express = require('express');
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const Course = require('../models/Course');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Enroll to course
router.post('/enroll/:courseId', isAuthenticated, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.session.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kursus tidak ditemukan' 
            });
        }

        // Check if already enrolled
        const isEnrolled = await Enrollment.isEnrolled(userId, courseId);
        if (isEnrolled) {
            return res.status(400).json({ 
                success: false, 
                message: 'Anda sudah terdaftar di kursus ini' 
            });
        }

        // Enroll user
        await Enrollment.enroll(userId, courseId);

        res.json({ 
            success: true, 
            message: 'Berhasil mendaftar kursus!' 
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mendaftar kursus' 
        });
    }
});

// Unenroll from course
router.delete('/unenroll/:courseId', isAuthenticated, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.session.user.id;

        const success = await Enrollment.unenroll(userId, courseId);
        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tidak ditemukan pendaftaran untuk kursus ini' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Berhasil keluar dari kursus' 
        });
    } catch (error) {
        console.error('Unenrollment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat keluar dari kursus' 
        });
    }
});

// Get user's enrolled courses
router.get('/my-courses', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const enrollments = await Enrollment.getUserEnrollments(userId, limit, offset);
        
        res.render('enrollment/my-courses', {
            title: 'Kursus Saya - ByzantiumEdu',
            enrollments,
            currentPage: page,
            user: req.session.user
        });
    } catch (error) {
        console.error('My courses error:', error);
        res.render('enrollment/my-courses', {
            title: 'Kursus Saya - ByzantiumEdu',
            enrollments: [],
            currentPage: 1,
            user: req.session.user
        });
    }
});

// Course learning page
router.get('/learn/:courseId', isAuthenticated, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.session.user.id;

        // Check if enrolled
        const isEnrolled = await Enrollment.isEnrolled(userId, courseId);
        if (!isEnrolled) {
            return res.redirect(`/courses/${courseId}`);
        }

        // Get course with modules and lessons
        const course = await Course.findByIdWithModules(courseId);
        if (!course) {
            return res.status(404).render('error/404', {
                title: 'Kursus Tidak Ditemukan',
                user: req.session.user
            });
        }

        // Get user's progress
        const progress = await LessonProgress.getCourseProgress(userId, courseId);
        const progressPercentage = await LessonProgress.getCourseProgressPercentage(userId, courseId);

        // Helper function untuk YouTube embed URL
        const getYouTubeEmbedUrl = (url) => {
            if (!url) return '';
            
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                return `https://www.youtube-nocookie.com/embed/${videoId}`;
            }
            
            return url;
        };

        res.render('enrollment/learn', {
            title: `${course.title} - Belajar - ByzantiumEdu`,
            course,
            progress,
            progressPercentage,
            getYouTubeEmbedUrl,
            user: req.session.user
        });
    } catch (error) {
        console.error('Learn page error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
});

// Mark lesson as completed
router.post('/complete-lesson/:lessonId', isAuthenticated, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.session.user.id;

        await LessonProgress.markCompleted(userId, lessonId);

        res.json({ 
            success: true, 
            message: 'Pelajaran berhasil diselesaikan!' 
        });
    } catch (error) {
        console.error('Complete lesson error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menyelesaikan pelajaran' 
        });
    }
});

// Mark lesson as incomplete
router.post('/incomplete-lesson/:lessonId', isAuthenticated, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.session.user.id;

        await LessonProgress.markIncomplete(userId, lessonId);

        res.json({ 
            success: true, 
            message: 'Pelajaran ditandai belum selesai' 
        });
    } catch (error) {
        console.error('Incomplete lesson error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengubah status pelajaran' 
        });
    }
});

// Get lesson progress
router.get('/lesson-progress/:lessonId', isAuthenticated, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.session.user.id;

        const isCompleted = await LessonProgress.isCompleted(userId, lessonId);

        res.json({ 
            success: true, 
            isCompleted 
        });
    } catch (error) {
        console.error('Lesson progress error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil progress pelajaran' 
        });
    }
});

module.exports = router; 
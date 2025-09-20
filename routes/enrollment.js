const express = require('express');
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const Course = require('../models/Course');
const { isAuthenticated } = require('../middleware/auth');
const { 
    getUserEnrollments, 
    getCourseProgress, 
    markLessonComplete 
} = require('../controllers/enrollmentController');

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
router.get('/my-courses', isAuthenticated, getUserEnrollments);

// Course learning page
router.get('/learn/:courseId', isAuthenticated, getCourseProgress);

// Mark lesson as completed
router.post('/complete-lesson/:lessonId', isAuthenticated, markLessonComplete);

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
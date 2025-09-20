const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Get user's enrolled courses
const getUserEnrollments = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const enrollments = await Enrollment.getByUserId(userId);
        
        res.render('enrollment/index', {
            title: 'Kelas Saya - ByzantiumEdu',
            enrollments,
            user: req.session.user
        });
    } catch (error) {
        console.error('Enrollments page error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memuat data');
        res.redirect('/');
    }
};

// Get course progress
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.session.user.id;
        
        // Check if user is enrolled
        const isEnrolled = await Enrollment.isEnrolled(userId, courseId);
        if (!isEnrolled) {
            req.flash('error_msg', 'Anda tidak terdaftar di kursus ini');
            return res.redirect('/courses');
        }
        
        // Get course with modules and lessons
        const course = await Course.findByIdWithModules(courseId);
        if (!course) {
            return res.status(404).render('error/404', {
                title: 'Kursus Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Get user progress
        const progress = await Enrollment.getProgress(userId, courseId);
        
        res.render('enrollment/progress', {
            title: `Progress: ${course.title} - ByzantiumEdu`,
            course,
            progress,
            user: req.session.user
        });
    } catch (error) {
        console.error('Course progress error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memuat progress');
        res.redirect('/enrollment');
    }
};

// Mark lesson as completed
const markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.session.user.id;
        
        await Enrollment.markLessonComplete(userId, lessonId);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Mark lesson complete error:', error);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
    }
};

module.exports = {
    getUserEnrollments,
    getCourseProgress,
    markLessonComplete
};
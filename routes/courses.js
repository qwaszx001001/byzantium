const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { 
    getAllCourses, 
    getCourseBySlug, 
    enrollInCourse, 
    searchCourses 
} = require('../controllers/courseController');

const router = express.Router();

// All courses page
router.get('/', getAllCourses);

// Course detail page
router.get('/:slug', getCourseBySlug);

// Enroll in course
router.post('/:id/enroll', isAuthenticated, enrollInCourse);

// Search courses
router.get('/search', searchCourses);

module.exports = router; 
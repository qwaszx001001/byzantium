const express = require('express');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Pedia = require('../models/Pedia');

const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    try {
        // Get featured courses
        const featuredCourses = await Course.getAllPublished(6, 0);
        
        // Get latest posts
        const latestPosts = await Post.getAllPublished(4, 0);
        
        // Get latest pedia articles
        const latestPedia = await Pedia.getAllPublished(4, 0);
        
        res.render('home/index', {
            title: 'Beranda - ByzantiumEdu',
            featuredCourses,
            latestPosts,
            latestPedia
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('home/index', {
            title: 'Beranda - ByzantiumEdu',
            featuredCourses: [],
            latestPosts: [],
            latestPedia: []
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('home/about', {
        title: 'Tentang Kami - ByzantiumEdu'
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('home/contact', {
        title: 'Kontak - ByzantiumEdu'
    });
});

module.exports = router; 
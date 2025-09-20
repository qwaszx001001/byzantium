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
        
        // Get latest activities
        const latestActivities = await Post.getAllPublished(4, 0);
        
        // Get latest pedia articles
        const latestPedia = await Pedia.getAllPublished(4, 0);
        
        res.render('home/index', {
            title: 'Beranda - ByzantiumEdu',
            featuredCourses,
            latestActivities,
            latestPedia,
            user: req.session.user
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('home/index', {
            title: 'Beranda - ByzantiumEdu',
            featuredCourses: [],
            latestActivities: [],
            latestPedia: [],
            user: req.session.user
        });
    }
});

// API endpoint for fetching content by category
router.get('/api/content/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 4;
        
        let items = [];
        
        switch(category) {
            case 'posts':
                items = await Post.getAllPublished(limit, 0);
                break;
            case 'course':
                items = await Course.getAllPublished(limit, 0);
                break;
            case 'pedia':
                items = await Pedia.getAllPublished(limit, 0);
                break;
            case 'news':
                // Get posts with category 'news'
                items = await Post.getByCategory('news', limit);
                // If no news found, get latest posts as fallback
                if (!items.length) {
                    items = await Post.getAllPublished(limit, 0);
                }
                break;
            default:
                items = await Post.getAllPublished(limit, 0);
        }
        
        res.json({ 
            success: true, 
            items,
            category 
        });
    } catch (error) {
        console.error('Content API error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('home/about', {
        title: 'Tentang Kami - ByzantiumEdu',
        user: req.session.user
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('home/contact', {
        title: 'Kontak - ByzantiumEdu',
        user: req.session.user
    });
});

module.exports = router; 
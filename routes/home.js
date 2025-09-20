const express = require('express');
const { 
    getHomePage, 
    getContentByCategory, 
    getAboutPage, 
    getContactPage 
} = require('../controllers/homeController');

const router = express.Router();

// Home page
router.get('/', getHomePage);

// API endpoint for fetching content by category
router.get('/api/content/:category', getContentByCategory);

// About page
router.get('/about', getAboutPage);

// Contact page
router.get('/contact', getContactPage);

module.exports = router; 
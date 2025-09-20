const express = require('express');
const { 
    getAllPosts, 
    getPostBySlug, 
    searchPosts 
} = require('../controllers/postController');

const router = express.Router();

// All posts page (Gallery Kegiatan)
router.get('/', getAllPosts);

// Post detail page (Activity Detail)
router.get('/:slug', getPostBySlug);

// Search posts
router.get('/search', searchPosts);

module.exports = router; 
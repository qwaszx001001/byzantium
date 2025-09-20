const express = require('express');
const { 
    getAllPediaArticles, 
    getPediaArticleBySlug, 
    searchPediaArticles 
} = require('../controllers/pediaController');

const router = express.Router();

// All pedia articles page
router.get('/', getAllPediaArticles);

// Article detail page
router.get('/:slug', getPediaArticleBySlug);

// Search articles
router.get('/search', searchPediaArticles);

module.exports = router; 
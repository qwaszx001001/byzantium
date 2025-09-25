const express = require('express');
const { 
    getAllPediaArticles, 
    getPediaArticleBySlug, 
    searchPediaArticles 
} = require('../controllers/pediaController');

const router = express.Router();

// Redirect pedia index to combined posts page with article filter
router.get('/', (req, res) => {
    res.redirect('/posts?type=article');
});

// Article detail page
router.get('/:slug', getPediaArticleBySlug);

// Search articles
router.get('/search', searchPediaArticles);

module.exports = router;
const express = require('express');
const Pedia = require('../models/Pedia');

const router = express.Router();

// All pedia articles page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const articles = await Pedia.getAllPublished(limit, offset);
        const totalArticles = await Pedia.countPublished();
        const totalPages = Math.ceil(totalArticles / limit);
        
        res.render('pedia/index', {
            title: 'Pedia - ByzantiumEdu',
            articles,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            query: req.query.q || ''
        });
    } catch (error) {
        console.error('Pedia page error:', error);
        res.render('pedia/index', {
            title: 'Pedia - ByzantiumEdu',
            articles: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: req.query.q || ''
        });
    }
});

// Article detail page
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await Pedia.findBySlug(slug);
        
        if (!article) {
            return res.status(404).render('error/404', {
                title: 'Artikel Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Increment view count
        await Pedia.incrementViewCount(article.id);
        
        // Get random articles for sidebar
        const randomArticles = await Pedia.getRandom(5);
        
        res.render('pedia/detail', {
            title: `${article.title} - ByzantiumEdu`,
            article,
            randomArticles
        });
    } catch (error) {
        console.error('Pedia detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
});

// Search articles
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/pedia');
        }
        
        const articles = await Pedia.search(q, 20);
        
        res.render('pedia/search', {
            title: `Hasil Pencarian: ${q} - ByzantiumEdu`,
            articles,
            query: q
        });
    } catch (error) {
        console.error('Pedia search error:', error);
        res.render('pedia/search', {
            title: 'Pencarian Artikel - ByzantiumEdu',
            articles: [],
            query: req.query.q || ''
        });
    }
});

module.exports = router; 
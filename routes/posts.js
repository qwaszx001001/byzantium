const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// All posts page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const posts = await Post.getAllPublished(limit, offset);
        const totalPosts = await Post.countPublished();
        const totalPages = Math.ceil(totalPosts / limit);
        
        res.render('posts/index', {
            title: 'Blog - ByzantiumEdu',
            posts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            query: req.query.q || ''
        });
    } catch (error) {
        console.error('Posts page error:', error);
        res.render('posts/index', {
            title: 'Blog - ByzantiumEdu',
            posts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: req.query.q || ''
        });
    }
});

// Post detail page
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findBySlug(slug);
        
        if (!post) {
            return res.status(404).render('error/404', {
                title: 'Postingan Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Increment view count
        await Post.incrementViewCount(post.id);
        
        res.render('posts/detail', {
            title: `${post.title} - ByzantiumEdu`,
            post
        });
    } catch (error) {
        console.error('Post detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/posts');
        }
        
        const posts = await Post.search(q, 20);
        
        res.render('posts/search', {
            title: `Hasil Pencarian: ${q} - ByzantiumEdu`,
            posts,
            query: q
        });
    } catch (error) {
        console.error('Post search error:', error);
        res.render('posts/search', {
            title: 'Pencarian Postingan - ByzantiumEdu',
            posts: [],
            query: req.query.q || ''
        });
    }
});

module.exports = router; 
const express = require('express');
const Post = require('../models/Post');
const PostImage = require('../models/PostImage');

const router = express.Router();

// All posts page (Gallery Kegiatan)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12; // Show more items for gallery
        const offset = (page - 1) * limit;
        
        const posts = await Post.getAllPublished(limit, offset);
        const totalPosts = await Post.countPublished();
        const totalPages = Math.ceil(totalPosts / limit);
        
        res.render('posts/index', {
            title: 'Gallery Kegiatan - ByzantiumEdu',
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
            title: 'Gallery Kegiatan - ByzantiumEdu',
            posts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: req.query.q || ''
        });
    }
});

// Post detail page (Activity Detail)
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findBySlug(slug);
        
        if (!post) {
            return res.status(404).render('error/404', {
                title: 'Kegiatan Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Get activity images
        const postImages = await PostImage.getByPostId(post.id);
        
        // Increment view count
        await Post.incrementViewCount(post.id);
        
        // Helper function untuk YouTube embed URL
        const getYouTubeEmbedUrl = (url) => {
            if (!url) return '';
            
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                return `https://www.youtube-nocookie.com/embed/${videoId}`;
            }
            
            return url;
        };
        
        res.render('posts/detail', {
            title: `${post.title} - ByzantiumEdu`,
            post,
            postImages,
            getYouTubeEmbedUrl,
            isAuthenticated: req.session.user ? true : false,
            isAdmin: req.session.user && req.session.user.role === 'admin',
            user: req.session.user
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
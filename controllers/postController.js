const Post = require('../models/Post');
const Pedia = require('../models/Pedia');

// All posts page
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const query = req.query.q || '';
        const type = req.query.type || 'all'; // all, article, activity
        
        let posts = [];
        let articles = [];
        let totalPosts = 0;
        let totalArticles = 0;
        
        // Fetch data based on type filter
        if (type === 'all' || type === 'activity') {
            if (query) {
                posts = await Post.search(query, limit);
                totalPosts = posts.length;
            } else {
                posts = await Post.getAllPublished(limit, offset);
                totalPosts = await Post.countPublished();
            }
        }
        
        if (type === 'all' || type === 'article') {
            if (query) {
                articles = await Pedia.search(query, limit);
                totalArticles = articles.length;
            } else {
                articles = await Pedia.getAllPublished(limit, offset);
                totalArticles = await Pedia.countPublished();
            }
        }
        
        const totalItems = type === 'all' ? (totalPosts + totalArticles) : (type === 'article' ? totalArticles : totalPosts);
        const totalPages = Math.ceil(totalItems / limit);
        
        res.render('posts/index', {
            title: 'Artikel & Kegiatan - ByzantiumEdu',
            posts: type === 'all' || type === 'activity' ? posts : [],
            articles: type === 'all' || type === 'article' ? articles : [],
            type,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            query: query,
            user: req.session.user
        });
    } catch (error) {
        console.error('Posts page error:', error);
        res.render('posts/index', {
            title: 'Artikel & Kegiatan - ByzantiumEdu',
            posts: [],
            articles: [],
            type: 'all',
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: req.query.q || '',
            user: req.session.user
        });
    }
};

// Post detail page
const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findBySlug(slug);
        
        if (!post) {
            return res.status(404).render('error/404', {
                title: 'Artikel Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Get related posts (using getByCategory as a substitute)
        const relatedPosts = await Post.getByCategory(post.category_name || 'Umum', 3);
        
        res.render('posts/detail', {
            title: `${post.title} - ByzantiumEdu`,
            post,
            relatedPosts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Post detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
};

// Search posts
const searchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/posts');
        }
        
        const posts = await Post.search(q, 20);
        
        res.render('posts/search', {
            title: `Hasil Pencarian: ${q} - ByzantiumEdu`,
            posts,
            query: q,
            user: req.session.user
        });
    } catch (error) {
        console.error('Post search error:', error);
        res.render('posts/search', {
            title: 'Pencarian Artikel - ByzantiumEdu',
            posts: [],
            query: req.query.q || '',
            user: req.session.user
        });
    }
};

module.exports = {
    getAllPosts,
    getPostBySlug,
    searchPosts
};
const express = require('express');
const Ebook = require('../models/Ebook');

const router = express.Router();

// All ebooks page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const search = req.query.search;
        
        let ebooks, totalEbooks;
        
        if (search) {
            ebooks = await Ebook.search(search, limit);
            totalEbooks = ebooks.length;
        } else {
            ebooks = await Ebook.getAll(limit, offset);
            totalEbooks = await Ebook.count();
        }
        
        const totalPages = Math.ceil(totalEbooks / limit);
        
        res.render('ebooks/index', {
            title: 'Ebook Gratis - ByzantiumEdu',
            ebooks,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            search,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebooks page error:', error);
        res.render('ebooks/index', {
            title: 'Ebook Gratis - ByzantiumEdu',
            ebooks: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            search: req.query.search,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user
        });
    }
});

// Ebook detail page
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const ebook = await Ebook.findBySlug(slug);
        
        if (!ebook) {
            return res.status(404).render('error/404', {
                title: 'Ebook Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Get related ebooks
        const relatedEbooks = await Ebook.getRandom(3);
        
        res.render('ebooks/detail', {
            title: `${ebook.title} - ByzantiumEdu`,
            ebook,
            relatedEbooks,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebook detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
});

// Download ebook
router.get('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const ebook = await Ebook.findById(id);
        
        if (!ebook) {
            return res.status(404).json({ error: 'Ebook tidak ditemukan' });
        }
        
        // Increment download count
        await Ebook.incrementDownloadCount(id);
        
        // Set file path
        const filePath = `public${ebook.pdf_file}`;
        
        // Download file
        res.download(filePath, `${ebook.title}.pdf`, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ error: 'Gagal mengunduh file' });
            }
        });
        
    } catch (error) {
        console.error('Download ebook error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengunduh' });
    }
});

// Ebooks by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const ebooks = await Ebook.getByCategory(categoryId, 20);
        
        res.render('ebooks/category', {
            title: 'Ebook Kategori - ByzantiumEdu',
            ebooks,
            categoryId,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebooks by category error:', error);
        res.render('ebooks/category', {
            title: 'Ebook Kategori - ByzantiumEdu',
            ebooks: [],
            categoryId: req.params.categoryId,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user
        });
    }
});

module.exports = router; 
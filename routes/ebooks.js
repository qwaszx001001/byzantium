const express = require('express');
const Ebook = require('../models/Ebook');
const { 
    getAllEbooks, 
    getEbookBySlug, 
    searchEbooks 
} = require('../controllers/ebookController');

const router = express.Router();

// All ebooks page
router.get('/', getAllEbooks);

// Ebook detail page
router.get('/:slug', getEbookBySlug);

// Search ebooks
router.get('/search', searchEbooks);

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
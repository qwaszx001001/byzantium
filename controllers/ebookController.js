const Ebook = require('../models/Ebook');

// All ebooks page
const getAllEbooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const ebooks = await Ebook.getAll(limit, offset, false); // Don't include drafts for public
        const totalEbooks = await Ebook.count(false); // Don't include drafts for public
        const totalPages = Math.ceil(totalEbooks / limit);
        
        res.render('ebooks/index', {
            title: 'E-Books - ByzantiumEdu',
            ebooks,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebooks page error:', error);
        res.render('ebooks/index', {
            title: 'E-Books - ByzantiumEdu',
            ebooks: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            user: req.session.user
        });
    }
};

// Ebook detail page
const getEbookBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const ebook = await Ebook.findBySlug(slug);
        
        if (!ebook) {
            return res.status(404).render('error/404', {
                title: 'E-Book Tidak Ditemukan',
                user: req.session.user
            });
        }
        
        // Increment view count
        await Ebook.incrementDownloadCount(ebook.id);
        
        res.render('ebooks/detail', {
            title: `${ebook.title} - ByzantiumEdu`,
            ebook,
            isAuthenticated: req.session.user ? true : false,
            isAdmin: req.session.user && req.session.user.role === 'admin',
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebook detail error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
};

// Search ebooks
const searchEbooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/ebooks');
        }
        
        const ebooks = await Ebook.search(q, 20);
        
        res.render('ebooks/search', {
            title: `Hasil Pencarian: ${q} - ByzantiumEdu`,
            ebooks,
            query: q,
            user: req.session.user
        });
    } catch (error) {
        console.error('Ebook search error:', error);
        res.render('ebooks/search', {
            title: 'Pencarian E-Book - ByzantiumEdu',
            ebooks: [],
            query: req.query.q || '',
            user: req.session.user
        });
    }
};

module.exports = {
    getAllEbooks,
    getEbookBySlug,
    searchEbooks
};
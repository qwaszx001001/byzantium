const express = require('express');
const router = express.Router();

// GET /byzanpedia
router.get('/', async (req, res) => {
    try {
        res.render('byzanpedia/index', {
            title: 'Byzan Pedia - Publisher',
            user: req.user
        });
    } catch (error) {
        console.error('Error in byzanpedia route:', error);
        res.status(500).render('error/500');
    }
});

module.exports = router; 
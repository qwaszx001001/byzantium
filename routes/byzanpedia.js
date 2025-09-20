const express = require('express');
const { getByzanpediaPage } = require('../controllers/byzanpediaController');

const router = express.Router();

// GET /byzanpedia
router.get('/', getByzanpediaPage);

module.exports = router; 
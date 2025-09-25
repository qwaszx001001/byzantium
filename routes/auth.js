const express = require('express');
const { body, validationResult } = require('express-validator');
const { isNotAuthenticated } = require('../middleware/auth');
const { 
    showCombinedAuthForm,
    registerCombined,
    login,
    logout 
} = require('../controllers/authController');

const router = express.Router();

// Combined login/register page (default)
router.get('/', isNotAuthenticated, showCombinedAuthForm);

// Combined login/register page
router.get('/combined', isNotAuthenticated, showCombinedAuthForm);

// Combined login/register process
router.post('/', isNotAuthenticated, async (req, res) => {
    const { action } = req.body;
    
    if (action === 'login') {
        return login(req, res);
    } else if (action === 'register') {
        return registerCombined(req, res);
    } else {
        req.flash('error_msg', 'Invalid action');
        return res.redirect('/auth');
    }
});

// Logout
router.get('/logout', logout);

module.exports = router;
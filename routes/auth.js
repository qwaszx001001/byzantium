const express = require('express');
const { body, validationResult } = require('express-validator');
const { isNotAuthenticated } = require('../middleware/auth');
const { 
    showRegisterForm, 
    register, 
    showLoginForm, 
    login, 
    logout 
} = require('../controllers/authController');

const router = express.Router();

// Register page
router.get('/register', isNotAuthenticated, showRegisterForm);

// Register process
router.post('/register', register);

// Login page
router.get('/login', isNotAuthenticated, showLoginForm);

// Login process
router.post('/login', isNotAuthenticated, login);

// Logout
router.get('/logout', logout);

module.exports = router; 
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Show login form
const showLoginForm = (req, res) => {
    res.render('auth/login', {
        title: 'Masuk - ByzantiumEdu',
        user: req.session.user
    });
};

// Handle login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            req.flash('error_msg', 'Email dan password harus diisi');
            return res.redirect('/auth/login');
        }
        
        // Check user
        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error_msg', 'Email atau password salah');
            return res.redirect('/auth/login');
        }
        
        // Check password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Email atau password salah');
            return res.redirect('/auth/login');
        }
        
        // Set session
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        };
        
        req.flash('success_msg', 'Berhasil masuk');
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat masuk');
        res.redirect('/auth/login');
    }
};

// Show register form
const showRegisterForm = (req, res) => {
    res.render('auth/register', {
        title: 'Daftar - ByzantiumEdu',
        user: req.session.user
    });
};

// Handle registration
const register = async (req, res) => {
    try {
        const { full_name, email, password, password2 } = req.body;
        
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/auth/register');
        }
        
        // Check if passwords match
        if (password !== password2) {
            req.flash('error_msg', 'Password tidak cocok');
            return res.redirect('/auth/register');
        }
        
        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error_msg', 'Email sudah terdaftar');
            return res.redirect('/auth/register');
        }
        
        // Create user
        const userId = await User.create({ full_name, email, password });
        
        req.flash('success_msg', 'Berhasil mendaftar! Silakan masuk.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat mendaftar');
        res.redirect('/auth/register');
    }
};

// Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            req.flash('error_msg', 'Terjadi kesalahan saat keluar');
        } else {
            res.redirect('/');
        }
    });
};

module.exports = {
    showLoginForm,
    login,
    showRegisterForm,
    register,
    logout
};
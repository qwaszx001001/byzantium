const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Show combined login/register form
const showCombinedAuthForm = (req, res) => {
    res.render('auth/combined', {
        title: 'Login & Register - ByzantiumEdu',
        user: req.session.user,
        errors: req.flash('errors'),
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
};

// Handle login
const login = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            req.flash('error_msg', 'Email dan password harus diisi');
            return res.redirect('/auth');
        }
        
        // Check user
        const user = await User.findByEmail(email);
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
            console.log('Login failed: User not found');
            req.flash('error_msg', 'Email atau password salah');
            return res.redirect('/auth');
        }
        
        // Check password
        const isMatch = await User.comparePassword(password, user.password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        if (!isMatch) {
            console.log('Login failed: Password incorrect');
            req.flash('error_msg', 'Email atau password salah');
            return res.redirect('/auth');
        }
        
        // Set session
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        };
        console.log('Session set:', req.session.user);
        
        req.flash('success_msg', 'Berhasil masuk');
        console.log('Login successful, redirecting to home');
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat masuk');
        res.redirect('/auth');
    }
};

// Handle combined registration
const registerCombined = async (req, res) => {
    try {
        const { username, full_name, email, password, password2 } = req.body;
        
        // Check if passwords match
        if (password !== password2) {
            req.flash('error_msg', 'Password tidak cocok');
            return res.redirect('/auth');
        }
        
        // Check if user exists (by email or username)
        const existingUser = await User.findByUsernameOrEmail(username, email);
        if (existingUser) {
            req.flash('error_msg', 'Username atau email sudah terdaftar');
            return res.redirect('/auth');
        }
        
        // Create user
        const userId = await User.create({ username, full_name, email, password });
        
        req.flash('success_msg', 'Berhasil mendaftar! Silakan masuk.');
        res.redirect('/auth');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat mendaftar');
        res.redirect('/auth');
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
    showCombinedAuthForm,
    login,
    registerCombined,
    logout
};
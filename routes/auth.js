const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isNotAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Register page
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth/register', { 
        title: 'Daftar - ByzantiumEdu',
        errors: []
    });
});

// Register process
router.post('/register', async (req, res) => {
    console.log('Register route hit');
    
    const { username, email, password, full_name, confirm_password } = req.body;
    console.log('Form data:', { username, email, full_name });

    // Simple validation
    if (!username || username.length < 3) {
        console.log('Username validation failed');
        return res.render('auth/register', {
            title: 'Daftar - ByzantiumEdu',
            errors: [{ msg: 'Username minimal 3 karakter' }]
        });
    }

    if (!email || !email.includes('@')) {
        console.log('Email validation failed');
        return res.render('auth/register', {
            title: 'Daftar - ByzantiumEdu',
            errors: [{ msg: 'Email tidak valid' }]
        });
    }

    if (!password || password.length < 6) {
        console.log('Password validation failed');
        return res.render('auth/register', {
            title: 'Daftar - ByzantiumEdu',
            errors: [{ msg: 'Password minimal 6 karakter' }]
        });
    }

    if (password !== confirm_password) {
        console.log('Password confirmation failed');
        return res.render('auth/register', {
            title: 'Daftar - ByzantiumEdu',
            errors: [{ msg: 'Password tidak cocok' }]
        });
    }

    if (!full_name) {
        console.log('Full name validation failed');
        return res.render('auth/register', {
            title: 'Daftar - ByzantiumEdu',
            errors: [{ msg: 'Nama lengkap harus diisi' }]
        });
    }

    // Check if user already exists
    try {
        const existingUser = await User.findByUsernameOrEmail(username, email);
        if (existingUser) {
            console.log('User already exists');
            let errorMessage = 'Username atau email sudah terdaftar';
            
            if (existingUser.username === username) {
                errorMessage = 'Username sudah digunakan, silakan pilih username lain';
            } else if (existingUser.email === email) {
                errorMessage = 'Email sudah terdaftar, silakan gunakan email lain';
            }
            
            return res.render('auth/register', {
                title: 'Daftar - ByzantiumEdu',
                errors: [{ msg: errorMessage }]
            });
        }

        // Create new user
        console.log('Creating new user...');
        const userId = await User.create({
            username,
            email,
            password,
            full_name,
            role: 'user'
        });

        console.log('User created successfully with ID:', userId);
        req.flash('success_msg', 'Registrasi berhasil! Silakan login.');
        return res.redirect('/auth/login');
    } catch (error) {
        console.error('Database error:', error);
        let errorMessage = 'Terjadi kesalahan saat registrasi';
        
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('username')) {
                errorMessage = 'Username sudah digunakan';
            } else if (error.message.includes('email')) {
                errorMessage = 'Email sudah terdaftar';
            }
        }
        
        req.flash('error_msg', errorMessage);
        return res.redirect('/auth/register');
    }
});

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', { 
        title: 'Login - ByzantiumEdu',
        errors: []
    });
});

// Login process
router.post('/login', isNotAuthenticated, async (req, res) => {
    console.log('Login route hit');
    
    const { email, password } = req.body;
    console.log('Login data:', { email });

    // Simple validation
    if (!email || !email.includes('@')) {
        console.log('Email validation failed');
        return res.render('auth/login', {
            title: 'Login - ByzantiumEdu',
            errors: [{ msg: 'Email tidak valid' }]
        });
    }

    if (!password || password.length < 1) {
        console.log('Password validation failed');
        return res.render('auth/login', {
            title: 'Login - ByzantiumEdu',
            errors: [{ msg: 'Password harus diisi' }]
        });
    }

    try {
        console.log('Finding user by email...');
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('User not found');
            return res.render('auth/login', {
                title: 'Login - ByzantiumEdu',
                errors: [{ msg: 'Email tidak terdaftar dalam sistem' }]
            });
        }

        console.log('User found, checking password...');
        // Check password
        const isPasswordValid = await User.comparePassword(password, user.password);
        if (!isPasswordValid) {
            console.log('Password invalid');
            return res.render('auth/login', {
                title: 'Login - ByzantiumEdu',
                errors: [{ msg: 'Password yang Anda masukkan salah' }]
            });
        }

        console.log('Password valid, setting session...');
        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };

        console.log('Session set, redirecting to home...');
        req.flash('success_msg', `Selamat datang, ${user.full_name}!`);
        return res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat login');
        return res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router; 
const User = require('../models/User');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Pedia = require('../models/Pedia');
const Ebook = require('../models/Ebook');
const Enrollment = require('../models/Enrollment');

// Admin dashboard
const getAdminDashboard = async (req, res) => {
    try {
        // Get statistics
        const userCount = await User.count();
        const courseCount = await Course.count();
        const postCount = await Post.countPublished();
        const pediaCount = await Pedia.countPublished();
        const ebookCount = await Ebook.countPublished();
        const enrollmentCount = await Enrollment.countAll();
        
        // Get recent activities
        const recentUsers = await User.getRecent(5);
        const recentCourses = await Course.getAll(5, 0);
        const recentPosts = await Post.getAllPublished(5, 0);
        
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - ByzantiumEdu',
            userCount,
            courseCount,
            postCount,
            pediaCount,
            ebookCount,
            enrollmentCount,
            recentUsers,
            recentCourses,
            recentPosts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('error/500', {
            title: 'Terjadi Kesalahan',
            user: req.session.user
        });
    }
};

// Get all users (for admin)
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const users = await User.getAll(limit, offset);
        const totalUsers = await User.count();
        const totalPages = Math.ceil(totalUsers / limit);
        
        res.render('admin/users/index', {
            title: 'Manajemen Pengguna - ByzantiumEdu',
            users,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin users error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memuat data pengguna');
        res.redirect('/admin');
    }
};

// Get user by ID (for admin)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            req.flash('error_msg', 'Pengguna tidak ditemukan');
            return res.redirect('/admin/users');
        }
        
        res.render('admin/users/detail', {
            title: `Detail Pengguna - ByzantiumEdu`,
            userDetail: user,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin user detail error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memuat detail pengguna');
        res.redirect('/admin/users');
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    getUserById
};
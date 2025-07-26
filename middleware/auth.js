const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Silakan login terlebih dahulu');
    res.redirect('/auth/login');
};

const isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Akses ditolak. Anda tidak memiliki izin admin');
    res.redirect('/');
};

const isAdminOrInstructor = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'instructor')) {
        return next();
    }
    req.flash('error_msg', 'Akses ditolak. Anda tidak memiliki izin yang cukup');
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    isAdmin,
    isAdminOrInstructor
}; 
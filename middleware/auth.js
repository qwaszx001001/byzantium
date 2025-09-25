const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        userRole: req.session?.user?.role
    });
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Silakan login terlebih dahulu');
    res.redirect('/auth');
};

const isNotAuthenticated = (req, res, next) => {
    console.log('Checking if not authenticated:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user
    });
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin access:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        userRole: req.session?.user?.role
    });
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Akses ditolak. Anda tidak memiliki izin admin');
    res.redirect('/');
};

const isAdminOrInstructor = (req, res, next) => {
    console.log('Checking admin/instructor access:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        userRole: req.session?.user?.role
    });
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
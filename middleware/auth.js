const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user,
        cookies: req.cookies
    });

    if (!req.session) {
        console.log('No session found');
        req.flash('error_msg', 'Silakan login terlebih dahulu');
        return res.redirect('/auth');
    }

    if (!req.session.user) {
        console.log('No user in session');
        req.flash('error_msg', 'Silakan login terlebih dahulu');
        return res.redirect('/auth');
    }

    return next();
};

const isNotAuthenticated = (req, res, next) => {
    console.log('Checking if not authenticated:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user
    });

    if (!req.session || !req.session.user) {
        return next();
    }
    res.redirect('/');
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin access:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user,
        role: req.session?.user?.role
    });

    if (!req.session || !req.session.user) {
        console.log('No session or user found');
        req.flash('error_msg', 'Silakan login terlebih dahulu');
        return res.redirect('/auth');
    }

    if (req.session.user.role !== 'admin') {
        console.log('User is not admin:', req.session.user.role);
        req.flash('error_msg', 'Akses ditolak. Anda tidak memiliki izin admin');
        return res.redirect('/');
    }

    return next();
};

const isAdminOrInstructor = (req, res, next) => {
    console.log('Checking admin/instructor access:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user,
        role: req.session?.user?.role
    });

    if (!req.session || !req.session.user) {
        console.log('No session or user found');
        req.flash('error_msg', 'Silakan login terlebih dahulu');
        return res.redirect('/auth');
    }

    if (req.session.user.role !== 'admin' && req.session.user.role !== 'instructor') {
        console.log('User is not admin or instructor:', req.session.user.role);
        req.flash('error_msg', 'Akses ditolak. Anda tidak memiliki izin yang cukup');
        return res.redirect('/');
    }

    return next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    isAdmin,
    isAdminOrInstructor
};
const User = require('../models/User');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Pedia = require('../models/Pedia');
const Ebook = require('../models/Ebook');
const Enrollment = require('../models/Enrollment');
const Instructor = require('../models/Instructor');
const CourseModule = require('../models/CourseModule');
const CourseLesson = require('../models/CourseLesson');
const PostImage = require('../models/PostImage');

// Admin dashboard
const getAdminDashboard = async (req, res) => {
    try {
        // Get statistics
        const userCount = await User.count();
        const courseCount = await Course.count();
        const postCount = await Post.countPublished();
        const pediaCount = await Pedia.countPublished();
        const ebookCount = await Ebook.count(false);
        const enrollmentCount = await Enrollment.countAll();
        
        // Get recent activities
        const recentUsers = await User.getRecent(5);
        const recentCourses = await Course.getAll(5, 0);
        const recentPosts = await Post.getAllPublished(5, 0);
        
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - ByzantiumEdu',
            stats: {
                totalUsers: userCount,
                totalCourses: courseCount,
                totalPosts: postCount,
                totalPedia: pediaCount,
                totalEbooks: ebookCount,
                totalInstructors: enrollmentCount
            },
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

// Course management
const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const courses = await Course.getAll(limit, offset);
        const totalCourses = await Course.count();
        const totalPages = Math.ceil(totalCourses / limit);
        
        res.render('admin/courses/index', {
            title: 'Kelola Kursus - ByzantiumEdu',
            courses,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin courses error:', error);
        res.render('admin/courses/index', {
            title: 'Kelola Kursus - ByzantiumEdu',
            courses: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            user: req.session.user
        });
    }
};

const getCreateCourse = async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0); // Get all instructors
        res.render('admin/courses/create', {
            title: 'Tambah Kursus - ByzantiumEdu',
            instructors,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/courses/create', {
            title: 'Tambah Kursus - ByzantiumEdu',
            instructors: [],
            user: req.session.user
        });
    }
};

const createCourse = async (req, res) => {
    try {
        // Simple validation
        if (!req.body.title || req.body.title.trim() === '') {
            const instructors = await Instructor.getAll(50, 0);
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Judul harus diisi' }],
                instructors,
                user: req.session.user
            });
        }
        
        if (!req.body.slug || req.body.slug.trim() === '') {
            const instructors = await Instructor.getAll(50, 0);
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Slug harus diisi' }],
                instructors,
                user: req.session.user
            });
        }
        
        if (!req.body.description || req.body.description.trim() === '') {
            const instructors = await Instructor.getAll(50, 0);
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Deskripsi harus diisi' }],
                instructors,
                user: req.session.user
            });
        }
        
        if (!req.body.content || req.body.content.trim() === '') {
            const instructors = await Instructor.getAll(50, 0);
            return res.render('admin/courses/create', {
                title: 'Tambah Kursus - ByzantiumEdu',
                errors: [{ msg: 'Konten harus diisi' }],
                instructors,
                user: req.session.user
            });
        }

        const courseData = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
            category_id: req.body.category_id || null,
            instructor_id: req.session.user.id,
            status: req.body.status || 'draft',
            price: req.body.price || 0,
            duration: req.body.duration || 0,
            level: req.body.level || 'beginner'
        };

        const courseId = await Course.create(courseData);
        
        req.flash('success_msg', 'Kursus berhasil ditambahkan');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Create course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah kursus');
        res.redirect('/admin/courses/create');
    }
};

const getEditCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error_msg', 'Kursus tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        res.render('admin/courses/edit', {
            title: 'Edit Kursus - ByzantiumEdu',
            course,
            user: req.session.user
        });
    } catch (error) {
        console.error('Edit course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category_id: req.body.category_id || null,
            is_published: req.body.is_published === 'on',
            is_free: req.body.is_free === 'on'
        };

        if (req.file) {
            updateData.thumbnail = `/uploads/${req.file.filename}`;
        }

        await Course.update(id, updateData);
        req.flash('success_msg', 'Kursus berhasil diperbarui');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Update course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui kursus');
        res.redirect('/admin/courses');
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.delete(id);
        req.flash('success_msg', 'Kursus berhasil dihapus');
        res.redirect('/admin/courses');
    } catch (error) {
        console.error('Delete course error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus kursus');
        res.redirect('/admin/courses');
    }
};

// Course Modules and Lessons management
const getCourseModules = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error_msg', 'Kursus tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const modules = await CourseModule.getByCourseId(req.params.id);
        
        res.render('admin/courses/modules', {
            title: 'Kelola Modul Kursus - ByzantiumEdu',
            course,
            modules,
            user: req.session.user
        });
    } catch (error) {
        console.error('Course modules error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
};

const createCourseModule = async (req, res) => {
    try {
        const { id } = req.params;
        const moduleData = {
            course_id: id,
            title: req.body.title,
            description: req.body.description,
            order_index: req.body.order_index || 0
        };
        
        await CourseModule.create(moduleData);
        req.flash('success_msg', 'Modul berhasil ditambahkan');
        res.redirect(`/admin/courses/${id}/modules`);
    } catch (error) {
        console.error('Create module error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah modul');
        res.redirect(`/admin/courses/${req.params.id}/modules`);
    }
};

const getCourseLessons = async (req, res) => {
    try {
        const module = await CourseModule.findById(req.params.id);
        if (!module) {
            req.flash('error_msg', 'Modul tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const course = await Course.findById(module.course_id);
        const lessons = await CourseLesson.getByModuleId(req.params.id);
        
        res.render('admin/courses/lessons', {
            title: 'Kelola Lesson Kursus - ByzantiumEdu',
            course,
            module,
            lessons,
            user: req.session.user
        });
    } catch (error) {
        console.error('Course lessons error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
};

const createCourseLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lessonData = {
            module_id: id,
            title: req.body.title,
            content: req.body.content,
            video_url: req.body.video_url,
            duration: req.body.duration || 0,
            order_index: req.body.order_index || 0
        };
        
        await CourseLesson.create(lessonData);
        req.flash('success_msg', 'Lesson berhasil ditambahkan');
        res.redirect(`/admin/modules/${id}/lessons`);
    } catch (error) {
        console.error('Create lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah lesson');
        res.redirect(`/admin/modules/${req.params.id}/lessons`);
    }
};

const getEditLesson = async (req, res) => {
    try {
        const lesson = await CourseLesson.findById(req.params.id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const module = await CourseModule.findById(lesson.module_id);
        const course = await Course.findById(module.course_id);
        
        res.render('admin/courses/edit-lesson', {
            title: 'Edit Lesson - ByzantiumEdu',
            lesson,
            module,
            course,
            user: req.session.user
        });
    } catch (error) {
        console.error('Edit lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/courses');
    }
};

const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await CourseLesson.findById(id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        const updateData = {
            title: req.body.title,
            content: req.body.content,
            video_url: req.body.video_url,
            duration: req.body.duration || 0,
            order_index: req.body.order_index || 0
        };
        
        await CourseLesson.update(id, updateData);
        req.flash('success_msg', 'Lesson berhasil diperbarui');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    } catch (error) {
        console.error('Update lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui lesson');
        res.redirect(`/admin/lessons/${req.params.id}/edit`);
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await CourseLesson.findById(id);
        if (!lesson) {
            req.flash('error_msg', 'Lesson tidak ditemukan');
            return res.redirect('/admin/courses');
        }
        
        await CourseLesson.delete(id);
        req.flash('success_msg', 'Lesson berhasil dihapus');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    } catch (error) {
        console.error('Delete lesson error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus lesson');
        res.redirect(`/admin/modules/${lesson.module_id}/lessons`);
    }
};

// Post management
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const posts = await Post.getAll(limit, offset);
        const totalPosts = await Post.count();
        const totalPages = Math.ceil(totalPosts / limit);
        
        res.render('admin/posts/index', {
            title: 'Kelola Kegiatan - ByzantiumEdu',
            posts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            query: req.query,
            categories: [
                { id: 1, name: 'Workshop & Pelatihan' },
                { id: 2, name: 'Kelas Mengajar' },
                { id: 3, name: 'Seminar & Webinar' },
                { id: 4, name: 'Kegiatan Siswa' },
                { id: 5, name: 'Aktivitas Luar Kelas' }
            ],
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin posts error:', error);
        res.render('admin/posts/index', {
            title: 'Kelola Kegiatan - ByzantiumEdu',
            posts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            query: {},
            categories: [],
            user: req.session.user
        });
    }
};

const getCreatePost = async (req, res) => {
    res.render('admin/posts/create', {
        title: 'Tambah Postingan - ByzantiumEdu',
        user: req.session.user
    });
};

const createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/posts/create', {
                title: 'Tambah Kegiatan - ByzantiumEdu',
                errors: errors.array(),
                oldData: req.body,
                user: req.session.user
            });
        }

        // Generate slug from title if not provided
        let slug = req.body.slug;
        if (!slug) {
            slug = req.body.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        const postData = {
            title: req.body.title,
            slug: slug,
            content: req.body.content,
            excerpt: req.body.excerpt,
            featured_image: req.files.featured_image ? `/uploads/${req.files.featured_image[0].filename}` : null,
            video_url: req.body.video_url || null,
            category_id: req.body.category_id || null,
            author_id: req.session.user.id,
            status: req.body.status || 'draft',
            activity_date: req.body.activity_date || null,
            location: req.body.location || null
        };

        const postId = await Post.create(postData);

        // Handle multiple activity images
        if (req.files.activity_images) {
            for (let i = 0; i < req.files.activity_images.length; i++) {
                const file = req.files.activity_images[i];
                await PostImage.create({
                    post_id: postId,
                    image_path: `/uploads/${file.filename}`,
                    order_index: i
                });
            }
        }

        req.flash('success_msg', 'Kegiatan berhasil ditambahkan');
        res.redirect('/admin/posts');
    } catch (error) {
        console.error('Create post error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah kegiatan');
        res.redirect('/admin/posts/create');
    }
};

// Pedia management
const getAllPediaArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const articles = await Pedia.getAll(limit, offset);
        const totalArticles = await Pedia.count();
        const totalPages = Math.ceil(totalArticles / limit);
        
        res.render('admin/pedia/index', {
            title: 'Kelola Artikel Pedia - ByzantiumEdu',
            articles,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin pedia error:', error);
        res.render('admin/pedia/index', {
            title: 'Kelola Artikel Pedia - ByzantiumEdu',
            articles: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            user: req.session.user
        });
    }
};

const getCreatePediaArticle = async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0); // Get all instructors
        res.render('admin/pedia/create', {
            title: 'Tambah Artikel Pedia - ByzantiumEdu',
            instructors,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/pedia/create', {
            title: 'Tambah Artikel Pedia - ByzantiumEdu',
            instructors: [],
            user: req.session.user
        });
    }
};

const createPediaArticle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/pedia/create');
        }

        const pediaData = {
            title: req.body.title,
            slug: req.body.slug,
            content: req.body.content,
            excerpt: req.body.excerpt || '',
            featured_image: req.file ? `/uploads/${req.file.filename}` : null,
            category_id: req.body.category_id || null,
            author_id: req.body.author_id,
            status: req.body.status || 'draft'
        };
        
        await Pedia.create(pediaData);
        req.flash('success_msg', 'Artikel Pedia berhasil ditambahkan');
        res.redirect('/admin/pedia');
    } catch (error) {
        console.error('Create pedia error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah artikel');
        res.redirect('/admin/pedia/create');
    }
};

// Ebook management
const getAllEbooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const ebooks = await Ebook.getAll(limit, offset, true); // Include drafts for admin
        const totalEbooks = await Ebook.count(true); // Include drafts for admin
        const totalPages = Math.ceil(totalEbooks / limit);
        
        res.render('admin/ebooks/index', {
            title: 'Kelola Ebook - ByzantiumEdu',
            ebooks,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin ebooks error:', error);
        res.render('admin/ebooks/index', {
            title: 'Kelola Ebook - ByzantiumEdu',
            ebooks: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            user: req.session.user
        });
    }
};

const getCreateEbook = async (req, res) => {
    try {
        const instructors = await Instructor.getAll(50, 0);
        res.render('admin/ebooks/create', {
            title: 'Tambah Ebook - ByzantiumEdu',
            instructors,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.render('admin/ebooks/create', {
            title: 'Tambah Ebook - ByzantiumEdu',
            instructors: [],
            user: req.session.user
        });
    }
};

const createEbook = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/ebooks/create');
        }

        if (!req.file) {
            req.flash('error_msg', 'File PDF harus diupload');
            return res.redirect('/admin/ebooks/create');
        }

        const ebookData = {
            title: req.body.title,
            description: req.body.description,
            pdf_file: `/uploads/${req.file.filename}`,
            category_id: req.body.category_id || null,
            author_id: req.body.author_id,
            status: req.body.status || 'published'
        };
        
        await Ebook.create(ebookData);
        req.flash('success_msg', 'Ebook berhasil ditambahkan');
        res.redirect('/admin/ebooks');
    } catch (error) {
        console.error('Create ebook error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah ebook');
        res.redirect('/admin/ebooks/create');
    }
};

const deleteEbook = async (req, res) => {
    try {
        const { id } = req.params;
        await Ebook.delete(id);
        req.flash('success_msg', 'Ebook berhasil dihapus');
        res.redirect('/admin/ebooks');
    } catch (error) {
        console.error('Delete ebook error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus ebook');
        res.redirect('/admin/ebooks');
    }
};

// Instructor management
const getAllInstructors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const instructors = await Instructor.getAll(limit, offset);
        const totalInstructors = await Instructor.count();
        const totalPages = Math.ceil(totalInstructors / limit);
        
        res.render('admin/instructors/index', {
            title: 'Kelola Instruktur - ByzantiumEdu',
            instructors,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin instructors error:', error);
        res.render('admin/instructors/index', {
            title: 'Kelola Instruktur - ByzantiumEdu',
            instructors: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            user: req.session.user
        });
    }
};

const getCreateInstructor = async (req, res) => {
    res.render('admin/instructors/create', {
        title: 'Tambah Instruktur - ByzantiumEdu',
        user: req.session.user
    });
};

const createInstructor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect('/admin/instructors/create');
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const instructorData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            full_name: req.body.full_name,
            bio: req.body.bio || '',
            avatar: req.file ? `/uploads/${req.file.filename}` : null
        };
        
        await Instructor.create(instructorData);
        req.flash('success_msg', 'Instruktur berhasil ditambahkan');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Create instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menambah instruktur');
        res.redirect('/admin/instructors/create');
    }
};

const getEditInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        res.render('admin/instructors/edit', {
            title: 'Edit Instruktur - ByzantiumEdu',
            instructor,
            user: req.session.user
        });
    } catch (error) {
        console.error('Edit instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/instructors');
    }
};

const updateInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await Instructor.findById(id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        const updateData = {
            username: req.body.username,
            email: req.body.email,
            full_name: req.body.full_name,
            bio: req.body.bio || '',
            avatar: req.file ? `/uploads/${req.file.filename}` : instructor.avatar
        };
        
        await Instructor.update(id, updateData);
        req.flash('success_msg', 'Instruktur berhasil diperbarui');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Update instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui instruktur');
        res.redirect(`/admin/instructors/${req.params.id}/edit`);
    }
};

const deleteInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Instructor.delete(id);
        if (!success) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        req.flash('success_msg', 'Instruktur berhasil dihapus');
        res.redirect('/admin/instructors');
    } catch (error) {
        console.error('Delete instructor error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menghapus instruktur');
        res.redirect('/admin/instructors');
    }
};

const getInstructorDetail = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            req.flash('error_msg', 'Instruktur tidak ditemukan');
            return res.redirect('/admin/instructors');
        }
        
        const courses = await Instructor.getCourses(req.params.id, 10, 0);
        
        res.render('admin/instructors/detail', {
            title: `${instructor.full_name} - Detail Instruktur - ByzantiumEdu`,
            instructor,
            courses,
            user: req.session.user
        });
    } catch (error) {
        console.error('Instructor detail error:', error);
        req.flash('error_msg', 'Terjadi kesalahan');
        res.redirect('/admin/instructors');
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    getUserById,
    getAllCourses,
    getCreateCourse,
    createCourse,
    getEditCourse,
    updateCourse,
    deleteCourse,
    getAllPosts,
    getCreatePost,
    createPost,
    getAllPediaArticles,
    getCreatePediaArticle,
    createPediaArticle,
    getAllEbooks,
    getCreateEbook,
    createEbook,
    deleteEbook,
    getAllInstructors,
    getCreateInstructor,
    createInstructor,
    getEditInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorDetail,
    getCourseModules,
    createCourseModule,
    getCourseLessons,
    createCourseLesson,
    getEditLesson,
    updateLesson,
    deleteLesson
};
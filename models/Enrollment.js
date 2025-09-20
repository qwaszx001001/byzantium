const db = require('../config/database');

class Enrollment {
    // Enroll user to course
    static async enroll(userId, courseId) {
        try {
            const [result] = await db.execute(
                'INSERT INTO user_course_enrollments (user_id, course_id) VALUES (?, ?)',
                [userId, courseId]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('User already enrolled in this course');
            }
            throw error;
        }
    }

    // Check if user is enrolled
    static async isEnrolled(userId, courseId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM user_course_enrollments WHERE user_id = ? AND course_id = ?',
                [userId, courseId]
            );
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get user's enrolled courses
    static async getUserEnrollments(userId, limit = 10, offset = 0) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    e.*,
                    c.title,
                    c.slug,
                    c.thumbnail,
                    c.description,
                    c.duration,
                    c.level,
                    cat.name as category_name,
                    u.full_name as instructor_name
                FROM user_course_enrollments e
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN categories cat ON c.category_id = cat.id
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE e.user_id = ?
                ORDER BY e.enrolled_at DESC
                LIMIT ? OFFSET ?
            `, [userId, limit, offset]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get enrollment count for a course
    static async getEnrollmentCount(courseId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM user_course_enrollments WHERE course_id = ?',
                [courseId]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Update progress
    static async updateProgress(userId, courseId, progress) {
        try {
            const [result] = await db.execute(
                'UPDATE user_course_enrollments SET progress = ? WHERE user_id = ? AND course_id = ?',
                [progress, userId, courseId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Mark course as completed
    static async markCompleted(userId, courseId) {
        try {
            const [result] = await db.execute(
                'UPDATE user_course_enrollments SET completed_at = NOW(), progress = 100 WHERE user_id = ? AND course_id = ?',
                [userId, courseId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get enrollment details
    static async getEnrollment(userId, courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    e.*,
                    c.title,
                    c.slug,
                    c.thumbnail,
                    c.description,
                    c.duration,
                    c.level
                FROM user_course_enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.user_id = ? AND e.course_id = ?
            `, [userId, courseId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Unenroll from course
    static async unenroll(userId, courseId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM user_course_enrollments WHERE user_id = ? AND course_id = ?',
                [userId, courseId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async countAll() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM user_course_enrollments');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Enrollment; 
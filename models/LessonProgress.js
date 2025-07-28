const db = require('../config/database');

class LessonProgress {
    // Mark lesson as completed
    static async markCompleted(userId, lessonId) {
        try {
            const [result] = await db.execute(
                'INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completed_at) VALUES (?, ?, TRUE, NOW()) ON DUPLICATE KEY UPDATE is_completed = TRUE, completed_at = NOW()',
                [userId, lessonId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Mark lesson as incomplete
    static async markIncomplete(userId, lessonId) {
        try {
            const [result] = await db.execute(
                'UPDATE user_lesson_progress SET is_completed = FALSE, completed_at = NULL WHERE user_id = ? AND lesson_id = ?',
                [userId, lessonId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Check if lesson is completed
    static async isCompleted(userId, lessonId) {
        try {
            const [rows] = await db.execute(
                'SELECT is_completed FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
                [userId, lessonId]
            );
            return rows.length > 0 && rows[0].is_completed;
        } catch (error) {
            throw error;
        }
    }

    // Get user's lesson progress for a course
    static async getCourseProgress(userId, courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    cl.id as lesson_id,
                    cl.title as lesson_title,
                    cl.duration as lesson_duration,
                    cm.title as module_title,
                    ulp.is_completed,
                    ulp.completed_at,
                    ulp.watch_duration
                FROM course_lessons cl
                JOIN course_modules cm ON cl.module_id = cm.id
                LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id AND ulp.user_id = ?
                WHERE cm.course_id = ?
                ORDER BY cm.order_index, cl.order_index
            `, [userId, courseId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update watch duration
    static async updateWatchDuration(userId, lessonId, duration) {
        try {
            const [result] = await db.execute(
                'INSERT INTO user_lesson_progress (user_id, lesson_id, watch_duration) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE watch_duration = ?',
                [userId, lessonId, duration, duration]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get progress percentage for a course
    static async getCourseProgressPercentage(userId, courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    COUNT(*) as total_lessons,
                    SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
                FROM course_lessons cl
                JOIN course_modules cm ON cl.module_id = cm.id
                LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id AND ulp.user_id = ?
                WHERE cm.course_id = ?
            `, [userId, courseId]);
            
            if (rows[0].total_lessons === 0) return 0;
            return Math.round((rows[0].completed_lessons / rows[0].total_lessons) * 100);
        } catch (error) {
            throw error;
        }
    }

    // Get user's completed lessons count
    static async getCompletedLessonsCount(userId, courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as count
                FROM user_lesson_progress ulp
                JOIN course_lessons cl ON ulp.lesson_id = cl.id
                JOIN course_modules cm ON cl.module_id = cm.id
                WHERE ulp.user_id = ? AND cm.course_id = ? AND ulp.is_completed = 1
            `, [userId, courseId]);
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Get total lessons count for a course
    static async getTotalLessonsCount(courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as count
                FROM course_lessons cl
                JOIN course_modules cm ON cl.module_id = cm.id
                WHERE cm.course_id = ?
            `, [courseId]);
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LessonProgress; 
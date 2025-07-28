const db = require('../config/database');

class CourseLesson {
    static async create(lessonData) {
        try {
            const { 
                module_id, 
                title, 
                content, 
                video_url, 
                duration = 0, 
                order_index = 0 
            } = lessonData;
            
            const [result] = await db.query(
                'INSERT INTO course_lessons (module_id, title, content, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?)',
                [module_id, title, content, video_url, duration, order_index]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM course_lessons WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getByModuleId(moduleId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index ASC',
                [moduleId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByCourseId(courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT cl.*, cm.title as module_title 
                FROM course_lessons cl 
                JOIN course_modules cm ON cl.module_id = cm.id 
                WHERE cm.course_id = ? 
                ORDER BY cm.order_index ASC, cl.order_index ASC
            `, [courseId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);
            values.push(id);
            
            const [result] = await db.execute(
                `UPDATE course_lessons SET ${fields} WHERE id = ?`,
                values
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM course_lessons WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async countByModuleId(moduleId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM course_lessons WHERE module_id = ?',
                [moduleId]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async getTotalDurationByCourseId(courseId) {
        try {
            const [rows] = await db.execute(`
                SELECT SUM(cl.duration) as total_duration 
                FROM course_lessons cl 
                JOIN course_modules cm ON cl.module_id = cm.id 
                WHERE cm.course_id = ?
            `, [courseId]);
            return rows[0].total_duration || 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CourseLesson; 
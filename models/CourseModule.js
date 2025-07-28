const db = require('../config/database');

class CourseModule {
    static async create(moduleData) {
        try {
            const { course_id, title, description, order_index = 0 } = moduleData;
            
            const [result] = await db.query(
                'INSERT INTO course_modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
                [course_id, title, description, order_index]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM course_modules WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getByCourseId(courseId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC',
                [courseId]
            );
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
                `UPDATE course_modules SET ${fields} WHERE id = ?`,
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
                'DELETE FROM course_modules WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async countByCourseId(courseId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM course_modules WHERE course_id = ?',
                [courseId]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CourseModule; 
const db = require('../config/database');

class Course {
    static async create(courseData) {
        try {
            const { 
                title, 
                slug, 
                description, 
                content, 
                thumbnail, 
                category_id, 
                instructor_id, 
                status = 'draft',
                price = 0,
                duration = 0,
                level = 'beginner'
            } = courseData;
            
            // Convert status to is_published
            const is_published = status === 'published';
            const is_free = price === 0 || price === '0';
            
            const [result] = await db.query(
                'INSERT INTO courses (title, slug, description, content, thumbnail, category_id, instructor_id, is_published, is_free, price, duration, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [title, slug, description, content, thumbnail, category_id, instructor_id, is_published, is_free, price, duration, level]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.id = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findBySlug(slug) {
        try {
            const [rows] = await db.execute(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.slug = ?
            `, [slug]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAllPublished(limit = 12, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.is_published = true 
                ORDER BY c.created_at DESC 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getAll(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                ORDER BY c.created_at DESC 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `);
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
                `UPDATE courses SET ${fields} WHERE id = ?`,
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
                'DELETE FROM courses WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM courses');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async countPublished() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM courses WHERE is_published = true');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async search(query, limit = 10) {
        try {
            const searchTerm = `%${query}%`;
            const [rows] = await db.execute(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.is_published = true AND (c.title LIKE ? OR c.description LIKE ?)
                ORDER BY c.created_at DESC 
                LIMIT ?
            `, [searchTerm, searchTerm, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByCategory(categoryId, limit = 10) {
        try {
            const [rows] = await db.execute(`
                SELECT c.*, cat.name as category_name, u.full_name as instructor_name 
                FROM courses c 
                LEFT JOIN categories cat ON c.category_id = cat.id 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.is_published = true AND c.category_id = ?
                ORDER BY c.created_at DESC 
                LIMIT ?
            `, [categoryId, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Course; 
const db = require('../config/database');

class Post {
    static async create(postData) {
        try {
            const { 
                title, 
                slug, 
                content, 
                excerpt, 
                featured_image, 
                video_url,
                category_id, 
                author_id, 
                status = 'draft',
                activity_date,
                location
            } = postData;
            
            const [result] = await db.execute(
                'INSERT INTO posts (title, slug, content, excerpt, featured_image, video_url, category_id, author_id, status, activity_date, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [title, slug, content, excerpt, featured_image, video_url, category_id, author_id, status, activity_date, location]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.id = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findBySlug(slug) {
        try {
            const [rows] = await db.execute(`
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.slug = ?
            `, [slug]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAllPublished(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.status = 'published' 
                ORDER BY p.created_at DESC 
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
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                ORDER BY p.created_at DESC 
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
                `UPDATE posts SET ${fields} WHERE id = ?`,
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
                'DELETE FROM posts WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async incrementViewCount(id) {
        try {
            const [result] = await db.execute(
                'UPDATE posts SET view_count = view_count + 1 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM posts');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async countPublished() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM posts WHERE status = "published"');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async search(query, limit = 10) {
        try {
            const searchTerm = `%${query}%`;
            const [rows] = await db.execute(`
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.status = 'published' AND (p.title LIKE ? OR p.content LIKE ?)
                ORDER BY p.created_at DESC 
                LIMIT ?
            `, [searchTerm, searchTerm, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByCategory(categoryName, limit = 10) {
        try {
            const [rows] = await db.execute(`
                SELECT p.*, cat.name as category_name, u.full_name as author_name 
                FROM posts p 
                LEFT JOIN categories cat ON p.category_id = cat.id 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.status = 'published' 
                AND cat.name = ?
                ORDER BY p.created_at DESC 
                LIMIT ?
            `, [categoryName, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Post; 
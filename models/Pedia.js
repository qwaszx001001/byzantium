const db = require('../config/database');

class Pedia {
    static async create(pediaData) {
        try {
            const { title, slug, content, excerpt, featured_image, category_id, author_id, status = 'draft' } = pediaData;
            
            const [result] = await db.execute(
                'INSERT INTO pedia_articles (title, slug, content, excerpt, featured_image, category_id, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [title, slug, content, excerpt, featured_image, category_id, author_id, status]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.id = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findBySlug(slug) {
        try {
            const [rows] = await db.execute(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.slug = ?
            `, [slug]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAllPublished(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' 
                ORDER BY pa.created_at DESC 
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
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                ORDER BY pa.created_at DESC 
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
                `UPDATE pedia_articles SET ${fields} WHERE id = ?`,
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
                'DELETE FROM pedia_articles WHERE id = ?',
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
                'UPDATE pedia_articles SET view_count = view_count + 1 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM pedia_articles');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async countPublished() {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM pedia_articles WHERE status = "published"');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async search(query, limit = 10) {
        try {
            const searchTerm = `%${query}%`;
            const [rows] = await db.execute(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' AND (pa.title LIKE ? OR pa.content LIKE ?)
                ORDER BY pa.created_at DESC 
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
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' AND pa.category_id = ?
                ORDER BY pa.created_at DESC 
                LIMIT ?
            `, [categoryId, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getRandom(limit = 5) {
        try {
            const [rows] = await db.execute(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name 
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' 
                ORDER BY RAND() 
                LIMIT ?
            `, [limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pedia; 
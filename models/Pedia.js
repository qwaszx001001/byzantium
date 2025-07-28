const db = require('../config/database');

class Pedia {
    static async create(pediaData) {
        try {
            const { title, slug, content, excerpt, featured_image, category_id, author_id, status = 'draft' } = pediaData;
            
            const [result] = await db.query(
                `INSERT INTO pedia_articles (title, slug, content, excerpt, featured_image, category_id, author_id, status) 
                 VALUES ('${title}', '${slug}', '${content}', '${excerpt || ''}', '${featured_image || ''}', ${category_id || 'NULL'}, ${author_id}, '${status}')`
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar, u.bio as author_bio
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.id = ${parseInt(id)}
            `);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findBySlug(slug) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar, u.bio as author_bio
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.slug = '${slug}'
            `);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAllPublished(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
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
            const fields = Object.keys(updateData).map(key => `${key} = '${updateData[key]}'`).join(', ');
            
            const [result] = await db.query(
                `UPDATE pedia_articles SET ${fields} WHERE id = ${parseInt(id)}`
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query(
                `DELETE FROM pedia_articles WHERE id = ${parseInt(id)}`
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async incrementViewCount(id) {
        try {
            const [result] = await db.query(
                `UPDATE pedia_articles SET view_count = view_count + 1 WHERE id = ${parseInt(id)}`
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as count FROM pedia_articles');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async countPublished() {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as count FROM pedia_articles WHERE status = "published"');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async search(query, limit = 10) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' AND (pa.title LIKE '%${query}%' OR pa.content LIKE '%${query}%')
                ORDER BY pa.created_at DESC 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByCategory(categoryId, limit = 10) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' AND pa.category_id = ${parseInt(categoryId)}
                ORDER BY pa.created_at DESC 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getRandom(limit = 5) {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM pedia_articles pa 
                LEFT JOIN categories cat ON pa.category_id = cat.id 
                LEFT JOIN users u ON pa.author_id = u.id 
                WHERE pa.status = 'published' 
                ORDER BY RAND() 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pedia; 
const db = require('../config/database');

class Ebook {
    // Create ebook
    static async create(ebookData) {
        try {
            const { title, description, pdf_file, category_id, author_id, status = 'published' } = ebookData;
            
            // Generate slug from title
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
            
            const [result] = await db.query(
                `INSERT INTO ebooks (title, slug, description, pdf_file, category_id, author_id, status) 
                 VALUES ('${title}', '${slug}', '${description}', '${pdf_file}', ${category_id || 'NULL'}, ${author_id}, '${status}')`
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Get all ebooks
    static async getAll(limit = 10, offset = 0, includeDraft = false) {
        try {
            const statusFilter = includeDraft ? '' : "WHERE e.status = 'published'";
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                ${statusFilter}
                ORDER BY e.created_at DESC 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get ebook by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar, u.bio as author_bio
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                WHERE e.id = ${parseInt(id)}
            `);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get ebook by slug
    static async findBySlug(slug) {
        try {
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar, u.bio as author_bio
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                WHERE e.slug = '${slug}'
            `);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get ebooks by category
    static async getByCategory(categoryId, limit = 10) {
        try {
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                WHERE e.status = 'published' AND e.category_id = ${parseInt(categoryId)}
                ORDER BY e.created_at DESC 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Search ebooks
    static async search(query, limit = 10) {
        try {
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                WHERE e.status = 'published' AND (e.title LIKE '%${query}%' OR e.description LIKE '%${query}%')
                ORDER BY e.created_at DESC 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update ebook
    static async update(id, updateData) {
        try {
            const fields = Object.keys(updateData).map(key => `${key} = '${updateData[key]}'`).join(', ');
            
            const [result] = await db.query(
                `UPDATE ebooks SET ${fields} WHERE id = ${parseInt(id)}`
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete ebook
    static async delete(id) {
        try {
            const [result] = await db.query(
                `DELETE FROM ebooks WHERE id = ${parseInt(id)}`
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Count ebooks
    static async count(includeDraft = false) {
        try {
            const statusFilter = includeDraft ? '' : "WHERE status = 'published'";
            const [rows] = await db.query(`SELECT COUNT(*) as count FROM ebooks ${statusFilter}`);
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Get random ebooks
    static async getRandom(limit = 5) {
        try {
            const [rows] = await db.query(`
                SELECT e.*, cat.name as category_name, u.full_name as author_name, u.avatar as author_avatar
                FROM ebooks e 
                LEFT JOIN categories cat ON e.category_id = cat.id 
                LEFT JOIN users u ON e.author_id = u.id 
                WHERE e.status = 'published' 
                ORDER BY RAND() 
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Increment download count
    static async incrementDownloadCount(id) {
        try {
            const [result] = await db.query(
                `UPDATE ebooks SET download_count = download_count + 1 WHERE id = ${parseInt(id)}`
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Ebook; 
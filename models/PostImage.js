const db = require('../config/database');

class PostImage {
    static async create(imageData) {
        try {
            const { post_id, image_path, caption, order_index = 0 } = imageData;
            
            const [result] = await db.query(
                'INSERT INTO post_images (post_id, image_path, caption, order_index) VALUES (?, ?, ?, ?)',
                [post_id, image_path, caption, order_index]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async getByPostId(postId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM post_images WHERE post_id = ? ORDER BY order_index ASC',
                [postId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM post_images WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async deleteByPostId(postId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM post_images WHERE post_id = ?',
                [postId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async countByPostId(postId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM post_images WHERE post_id = ?',
                [postId]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PostImage; 
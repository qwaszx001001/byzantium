const db = require('../config/database');

class Instructor {
    // Get all instructors
    static async getAll(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.full_name,
                    u.avatar,
                    u.bio,
                    u.created_at,
                    COUNT(c.id) as course_count
                FROM users u
                LEFT JOIN courses c ON u.id = c.instructor_id
                WHERE u.role = 'instructor'
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get instructor by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.full_name,
                    u.avatar,
                    u.bio,
                    u.created_at,
                    COUNT(c.id) as course_count
                FROM users u
                LEFT JOIN courses c ON u.id = c.instructor_id
                WHERE u.id = ${parseInt(id)} AND u.role = 'instructor'
                GROUP BY u.id
            `);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Create instructor
    static async create(instructorData) {
        try {
            const { username, email, password, full_name, bio, avatar } = instructorData;
            
            const [result] = await db.query(
                `INSERT INTO users (username, email, password, full_name, bio, avatar, role) 
                 VALUES ('${username}', '${email}', '${password}', '${full_name}', '${bio || ''}', '${avatar || ''}', 'instructor')`
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update instructor
    static async update(id, updateData) {
        try {
            const { username, email, full_name, bio, avatar } = updateData;
            
            const [result] = await db.query(
                `UPDATE users SET username = '${username}', email = '${email}', full_name = '${full_name}', bio = '${bio || ''}', avatar = '${avatar || ''}' WHERE id = ${parseInt(id)} AND role = 'instructor'`
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete instructor
    static async delete(id) {
        try {
            const [result] = await db.query(
                `DELETE FROM users WHERE id = ${parseInt(id)} AND role = 'instructor'`
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get instructor's courses
    static async getCourses(instructorId, limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.*,
                    cat.name as category_name
                FROM courses c
                LEFT JOIN categories cat ON c.category_id = cat.id
                WHERE c.instructor_id = ${parseInt(instructorId)}
                ORDER BY c.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Count instructors
    static async count() {
        try {
            const [rows] = await db.query(
                'SELECT COUNT(*) as count FROM users WHERE role = "instructor"'
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Search instructors
    static async search(query, limit = 10) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.full_name,
                    u.avatar,
                    u.bio,
                    u.created_at,
                    COUNT(c.id) as course_count
                FROM users u
                LEFT JOIN courses c ON u.id = c.instructor_id
                WHERE u.role = 'instructor' AND (u.full_name LIKE '%${query}%' OR u.bio LIKE '%${query}%')
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT ${parseInt(limit)}
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Instructor; 
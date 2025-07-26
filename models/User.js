const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        try {
            const { username, email, password, full_name, role = 'user' } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.query(
                'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, full_name, role]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUsernameOrEmail(username, email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, email]
            );
            return rows[0]; // Return first match
        } catch (error) {
            throw error;
        }
    }

    static async checkUserExists(username, email) {
        try {
            const [rows] = await db.query(
                'SELECT username, email FROM users WHERE username = ? OR email = ?',
                [username, email]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);
            values.push(id);
            
            const [result] = await db.query(
                `UPDATE users SET ${fields} WHERE id = ?`,
                values
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await db.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    static async getAll(limit = 10, offset = 0) {
        try {
            const [rows] = await db.query(
                `SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User; 
const db = require('./config/database');

async function createEnrollmentTables() {
    try {
        console.log('Creating enrollment tables...');

        // Create user_course_enrollments table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_course_enrollments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                progress INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_enrollment (user_id, course_id)
            )
        `);
        console.log('✅ user_course_enrollments table created');

        // Create user_lesson_progress table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_lesson_progress (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                lesson_id INT NOT NULL,
                is_completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP NULL,
                watch_duration INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
                UNIQUE KEY unique_progress (user_id, lesson_id)
            )
        `);
        console.log('✅ user_lesson_progress table created');

        console.log('🎉 All enrollment tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating enrollment tables:', error);
        process.exit(1);
    }
}

createEnrollmentTables(); 
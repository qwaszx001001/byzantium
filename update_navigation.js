const fs = require('fs');
const path = require('path');

// Files that need to be updated to use layout
const filesToUpdate = [
    'views/posts/index.ejs',
    'views/posts/detail.ejs',
    'views/pedia/index.ejs',
    'views/pedia/detail.ejs',
    'views/ebooks/index.ejs',
    'views/ebooks/detail.ejs',
    'views/courses/index.ejs',
    'views/courses/detail.ejs',
    'views/enrollment/my-courses.ejs',
    'views/enrollment/learn.ejs',
    'views/home/index.ejs',
    'views/home/about.ejs',
    'views/home/contact.ejs',
    'views/auth/login.ejs',
    'views/auth/register.ejs',
    'views/error/404.ejs',
    'views/error/500.ejs'
];

// Admin files that need to use admin layout
const adminFilesToUpdate = [
    'views/admin/courses/index.ejs',
    'views/admin/courses/create.ejs',
    'views/admin/courses/edit.ejs',
    'views/admin/courses/modules.ejs',
    'views/admin/courses/lessons.ejs',
    'views/admin/courses/edit-lesson.ejs',
    'views/admin/posts/index.ejs',
    'views/admin/posts/create.ejs',
    'views/admin/pedia/index.ejs',
    'views/admin/pedia/create.ejs',
    'views/admin/instructors/index.ejs',
    'views/admin/instructors/create.ejs',
    'views/admin/users/index.ejs'
];

function updateFileToUseLayout(filePath, isAdmin = false) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove the entire HTML structure and keep only the main content
        const startTag = '<!DOCTYPE html>';
        const endTag = '</html>';
        
        const startIndex = content.indexOf(startTag);
        const endIndex = content.lastIndexOf(endTag);
        
        if (startIndex !== -1 && endIndex !== -1) {
            // Extract the main content (between <main> tags or create one)
            const mainStart = content.indexOf('<main>');
            const mainEnd = content.indexOf('</main>');
            
            let mainContent = '';
            if (mainStart !== -1 && mainEnd !== -1) {
                mainContent = content.substring(mainStart + 6, mainEnd);
            } else {
                // Find content between body tags
                const bodyStart = content.indexOf('<body>');
                const bodyEnd = content.indexOf('</body>');
                if (bodyStart !== -1 && bodyEnd !== -1) {
                    const bodyContent = content.substring(bodyStart + 7, bodyEnd);
                    
                    // Remove navigation and flash messages
                    const navStart = bodyContent.indexOf('<nav');
                    const navEnd = bodyContent.indexOf('</nav>') + 6;
                    
                    let contentWithoutNav = bodyContent;
                    if (navStart !== -1 && navEnd !== -1) {
                        contentWithoutNav = bodyContent.substring(0, navStart) + bodyContent.substring(navEnd);
                    }
                    
                    // Remove flash messages
                    const flashStart = contentWithoutNav.indexOf('<!-- Flash Messages -->');
                    const flashEnd = contentWithoutNav.indexOf('<!-- Main Content -->');
                    
                    if (flashStart !== -1 && flashEnd !== -1) {
                        contentWithoutNav = contentWithoutNav.substring(0, flashStart) + contentWithoutNav.substring(flashEnd);
                    }
                    
                    // Remove footer
                    const footerStart = contentWithoutNav.indexOf('<footer');
                    if (footerStart !== -1) {
                        contentWithoutNav = contentWithoutNav.substring(0, footerStart);
                    }
                    
                    mainContent = contentWithoutNav.trim();
                }
            }
            
            // Create new content with layout include
            const layoutName = isAdmin ? '../layouts/admin' : '../layouts/main';
            const newContent = `<%- include('${layoutName}', { title: title, user: user, content: \`${mainContent}\` }) %>`;
            
            fs.writeFileSync(filePath, newContent);
            console.log(`✅ Updated ${filePath} to use ${isAdmin ? 'admin' : 'main'} layout`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all files
console.log('🔄 Updating navigation headers...\n');

// Update regular files
filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        updateFileToUseLayout(file, false);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

// Update admin files
adminFilesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        updateFileToUseLayout(file, true);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\n✅ Navigation update completed!');
console.log('📝 All files now use consistent navigation headers'); 
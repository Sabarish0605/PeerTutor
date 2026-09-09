const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/LandingPage.jsx',
    'src/pages/StudentDashboard.jsx',
    'src/pages/MyLearning.jsx',
    'src/pages/TutorDashboard.jsx'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${file}, not found.`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf-8');

    // Action: Change their backgrounds from bg-white (or bg-[#F8F9FA]) to bg-gray-100
    content = content.replace(/bg-\[\#F8F9FA\]/g, 'bg-gray-100');
    content = content.replace(/bg-white/g, 'bg-gray-100');
    content = content.replace(/bg-primary-50/g, 'bg-gray-200');

    // Action: Ensure borders are border-gray-300
    content = content.replace(/border-gray-100/g, 'border-gray-300');
    content = content.replace(/border-gray-200/g, 'border-gray-300');
    content = content.replace(/border-primary-100/g, 'border-gray-300');

    // Action: Text is strictly text-gray-900 for headings and text-gray-700 for paragraphs
    content = content.replace(/text-gray-500/g, 'text-gray-700');
    content = content.replace(/text-primary-600/g, 'text-gray-900');
    content = content.replace(/text-primary-700/g, 'text-gray-900');

    // Action: Ensure primary buttons use bg-gray-800 hover:bg-gray-900 text-white
    content = content.replace(/bg-primary-600/g, 'bg-gray-800');
    content = content.replace(/hover:bg-primary-700/g, 'hover:bg-gray-900');
    
    // Some buttons had text-white, let's make sure
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated ${file}`);
});

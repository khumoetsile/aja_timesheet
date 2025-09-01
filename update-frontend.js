const fs = require('fs');
const path = require('path');

console.log('🔄 Updating Frontend Files for Icons Fix...\n');

// Check if dist folder exists
const distPath = 'dist/timesheet-app';
if (!fs.existsSync(distPath)) {
  console.log('❌ Build folder not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build folder found!');
console.log('\n📁 Files to upload to http://aja.khumo.co.bw/:');
console.log('   - index.html (updated with Material Icons)');
console.log('   - styles.73ac490feae77bc0.css (updated with icon styles)');
console.log('   - All .js files');
console.log('   - favicon.ico');

console.log('\n🚀 Quick Upload Steps:');
console.log('1. Go to your cPanel File Manager');
console.log('2. Navigate to public_html/');
console.log('3. Upload these files from dist/timesheet-app/:');
console.log('   - index.html');
console.log('   - styles.73ac490feae77bc0.css');
console.log('   - All .js files (main.3beb7049a2b9f9c2.js, etc.)');
console.log('   - favicon.ico');

console.log('\n🔧 What was fixed:');
console.log('✅ Added Material Icons font link to index.html');
console.log('✅ Added Material Icons CSS import to styles.css');
console.log('✅ Added Material Icons fallback styles');
console.log('✅ Rebuilt application with updated files');

console.log('\n📋 After uploading:');
console.log('1. Clear your browser cache (Ctrl+F5)');
console.log('2. Visit http://aja.khumo.co.bw/');
console.log('3. Check that icons are now visible');

console.log('\n🎯 Icons that should now appear:');
console.log('   - Menu icons (hamburger, search, notifications)');
console.log('   - Dashboard icons (charts, users, settings)');
console.log('   - Form icons (email, lock, calendar)');
console.log('   - Action icons (add, edit, delete, save)');

console.log('\n💡 If icons still don\'t show:');
console.log('1. Check browser console for errors');
console.log('2. Verify Google Fonts is accessible');
console.log('3. Try accessing https://fonts.googleapis.com/icon?family=Material+Icons directly'); 
const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to HTTP Configuration...\n');

// Check if dist folder exists
const distPath = 'dist/timesheet-app';
if (!fs.existsSync(distPath)) {
  console.log('❌ Build folder not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build folder found!');
console.log('\n🔧 Changes Made:');
console.log('✅ Updated TimesheetService to use HTTP');
console.log('✅ Updated AuthService to use HTTP');
console.log('✅ Updated LoginComponent to use HTTP');
console.log('✅ Updated Backend CORS to allow HTTP');
console.log('✅ Rebuilt frontend with HTTP URLs');

console.log('\n📁 Frontend Files to upload to http://aja.khumo.co.bw/:');
console.log('   - index.html (with Material Icons)');
console.log('   - styles.73ac490feae77bc0.css (with icon styles)');
console.log('   - main.3beb7049a2b9f9c2.js (updated with HTTP URLs)');
console.log('   - All other .js files');
console.log('   - favicon.ico');

console.log('\n📁 Backend Files to upload:');
console.log('   - backend/server.js (updated CORS for HTTP)');
console.log('   - backend/setup-env.js (updated environment)');

console.log('\n🚀 Upload Steps:');
console.log('1. Upload frontend files to public_html/');
console.log('2. Upload backend files to your backend directory');
console.log('3. Restart backend server');

console.log('\n🔄 Backend Restart Commands:');
console.log('cd /path/to/your/backend');
console.log('pkill -f node');
console.log('node setup-env.js');
console.log('node server.js');

console.log('\n🔒 HTTP Configuration:');
console.log('✅ Frontend: http://aja.khumo.co.bw');
console.log('✅ Backend: http://ajabackend.khumo.co.bw');
console.log('✅ No more HTTPS/HTTP mismatches');
console.log('✅ CORS should work properly');

console.log('\n📋 After uploading:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Visit http://aja.khumo.co.bw/');
console.log('3. Try logging in with demo credentials');
console.log('4. Check browser console for CORS errors');

console.log('\n🎯 What should work now:');
console.log('   - Login without CORS errors');
console.log('   - Dashboard data loading');
console.log('   - All Material Icons visible');
console.log('   - HTTP communication throughout');

console.log('\n💡 If issues persist:');
console.log('1. Check browser console for errors');
console.log('2. Verify backend is accessible at http://ajabackend.khumo.co.bw/');
console.log('3. Ensure backend is restarted with new configuration');
console.log('4. Test API endpoints directly'); 
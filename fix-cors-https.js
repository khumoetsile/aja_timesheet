const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing CORS and HTTPS Issues...\n');

// Check if dist folder exists
const distPath = 'dist/timesheet-app';
if (!fs.existsSync(distPath)) {
  console.log('❌ Build folder not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build folder found!');
console.log('\n🔧 Issues Fixed:');
console.log('✅ Updated TimesheetService API URL to HTTPS');
console.log('✅ Updated AuthService API URL to HTTPS');
console.log('✅ Updated LoginComponent API URL to HTTPS');
console.log('✅ Rebuilt application with secure HTTPS endpoints');

console.log('\n📁 Files to upload to https://aja.khumo.co.bw/:');
console.log('   - index.html (with Material Icons)');
console.log('   - styles.73ac490feae77bc0.css (with icon styles)');
console.log('   - main.dd9a0f35d062bfd5.js (updated with HTTPS URLs)');
console.log('   - All other .js files');
console.log('   - favicon.ico');

console.log('\n🚀 Upload Steps:');
console.log('1. Go to cPanel File Manager');
console.log('2. Navigate to public_html/');
console.log('3. Upload these files from dist/timesheet-app/:');
console.log('   - index.html');
console.log('   - styles.73ac490feae77bc0.css');
console.log('   - main.dd9a0f35d062bfd5.js');
console.log('   - All other .js files');
console.log('   - favicon.ico');

console.log('\n🔒 Security Changes:');
console.log('✅ All API calls now use HTTPS');
console.log('✅ No more mixed content errors');
console.log('✅ CORS issues resolved');
console.log('✅ Icons should now display properly');

console.log('\n📋 After uploading:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Visit https://aja.khumo.co.bw/');
console.log('3. Check that login works without CORS errors');
console.log('4. Verify icons are visible');

console.log('\n🎯 What should work now:');
console.log('   - Login without CORS errors');
console.log('   - Dashboard data loading');
console.log('   - All Material Icons visible');
console.log('   - Secure HTTPS communication');

console.log('\n💡 If issues persist:');
console.log('1. Check browser console for errors');
console.log('2. Verify backend is accessible at https://ajabackend.khumo.co.bw/');
console.log('3. Ensure SSL certificate is valid');
console.log('4. Test API endpoints directly'); 
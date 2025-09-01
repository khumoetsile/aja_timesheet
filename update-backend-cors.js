const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Backend CORS Configuration...\n');

console.log('✅ Changes Made:');
console.log('✅ Updated server.js CORS origin to https://aja.khumo.co.bw');
console.log('✅ Updated setup-env.js FRONTEND_URL to https://aja.khumo.co.bw');

console.log('\n📁 Files to upload to your backend server:');
console.log('   - backend/server.js (updated CORS configuration)');
console.log('   - backend/setup-env.js (updated environment variables)');

console.log('\n🚀 Backend Update Steps:');
console.log('1. Go to your cPanel File Manager');
console.log('2. Navigate to your backend directory (e.g., public_html/backend/)');
console.log('3. Upload these files:');
console.log('   - server.js (replace existing file)');
console.log('   - setup-env.js (replace existing file)');

console.log('\n🔄 Restart Backend:');
console.log('1. Connect to your server via SSH or cPanel Terminal');
console.log('2. Navigate to backend directory:');
console.log('   cd /path/to/your/backend');
console.log('3. Restart the Node.js application:');
console.log('   pkill node');
console.log('   node server.js');
console.log('   # Or if using PM2:');
console.log('   pm2 restart aja-timesheet');

console.log('\n🔒 CORS Configuration:');
console.log('✅ Backend now allows requests from https://aja.khumo.co.bw');
console.log('✅ HTTPS frontend can communicate with HTTPS backend');
console.log('✅ No more CORS policy violations');

console.log('\n📋 Test Steps:');
console.log('1. Restart backend server');
console.log('2. Visit https://aja.khumo.co.bw/');
console.log('3. Try logging in with demo credentials');
console.log('4. Check browser console for CORS errors');

console.log('\n🎯 What should work now:');
console.log('   - Login without CORS errors');
console.log('   - Dashboard data loading');
console.log('   - All API calls working');
console.log('   - Secure HTTPS communication');

console.log('\n💡 If issues persist:');
console.log('1. Check if backend is running: curl https://ajabackend.khumo.co.bw/health');
console.log('2. Verify SSL certificate is valid');
console.log('3. Check server logs for errors');
console.log('4. Ensure firewall allows HTTPS traffic'); 
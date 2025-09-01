const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing AJA Timesheet for cPanel Deployment...\n');

// Create deployment directories
const deployDir = 'cpanel-deployment';
const frontendDir = path.join(deployDir, 'frontend');
const backendDir = path.join(deployDir, 'backend');

// Create directories
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
}

// Copy frontend files (Angular build)
console.log('📁 Copying frontend files...');
const frontendSource = 'dist/timesheet-app';
const frontendFiles = fs.readdirSync(frontendSource);

frontendFiles.forEach(file => {
  const sourcePath = path.join(frontendSource, file);
  const destPath = path.join(frontendDir, file);
  
  if (fs.statSync(sourcePath).isDirectory()) {
    // Copy directory
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    copyDirectory(sourcePath, destPath);
  } else {
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Copy backend files
console.log('📁 Copying backend files...');
const backendSource = 'backend';
const backendFiles = fs.readdirSync(backendSource);

backendFiles.forEach(file => {
  const sourcePath = path.join(backendSource, file);
  const destPath = path.join(backendDir, file);
  
  if (fs.statSync(sourcePath).isDirectory()) {
    // Copy directory
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    copyDirectory(sourcePath, destPath);
  } else {
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Create deployment instructions
const instructions = `# AJA Timesheet - cPanel Deployment Files

## 📁 File Structure Created:
- \`frontend/\` - Angular build files (upload to public_html/)
- \`backend/\` - Node.js backend files (upload to public_html/backend/)

## 🚀 Quick Deployment Steps:

### 1. Database Setup in cPanel:
- Create database: khumocob_aja
- Create user: khumocob_aja (password: khumocob_aja)
- Assign user to database with ALL PRIVILEGES

### 2. Upload Files:
- Upload \`frontend/\` contents to \`public_html/\`
- Upload \`backend/\` contents to \`public_html/backend/\`

### 3. Configure Backend:
- Update \`backend/.env\` with your domain
- Set FRONTEND_URL=https://yourdomain.com

### 4. Start Backend:
\`\`\`bash
cd public_html/backend
npm install
node setup.js
node create-tables.js
node server.js
\`\`\`

### 5. Test:
- Frontend: https://yourdomain.com
- Backend: https://yourdomain.com/backend/health

## 👤 Default Users:
- Admin: admin@aja.com / admin123
- Supervisor: supervisor@aja.com / admin123
- Staff: staff@aja.com / admin123

## 📞 Support:
Check CPANEL-DEPLOYMENT.md for detailed instructions.
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT-INSTRUCTIONS.md'), instructions);

console.log('✅ Deployment files prepared successfully!');
console.log('\n📁 Created directory: cpanel-deployment/');
console.log('   ├── frontend/ (upload to public_html/)');
console.log('   └── backend/ (upload to public_html/backend/)');
console.log('\n📋 Next steps:');
console.log('1. Upload frontend/ contents to public_html/');
console.log('2. Upload backend/ contents to public_html/backend/');
console.log('3. Set up database in cPanel');
console.log('4. Start the backend application');
console.log('\n📖 See CPANEL-DEPLOYMENT.md for detailed instructions');

function copyDirectory(source, destination) {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
} 
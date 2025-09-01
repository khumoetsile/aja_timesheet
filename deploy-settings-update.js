const fs = require('fs-extra');
const path = require('path');

console.log('📦 Creating settings deployment package...');

// Create deployment directory
const deployDir = './settings-deployment';
fs.ensureDirSync(deployDir);

// Files to upload to production
const filesToDeploy = [
  {
    source: './routes/settings.js',
    dest: 'backend/routes/settings.js',
    description: 'Settings API routes'
  },
  {
    source: './server.js', 
    dest: 'backend/server.js',
    description: 'Updated server with settings routes'
  }
];

// Copy files
filesToDeploy.forEach(file => {
  const sourcePath = path.join(__dirname, file.source);
  const destPath = path.join(deployDir, file.dest);
  
  fs.ensureDirSync(path.dirname(destPath));
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file.description}`);
  } else {
    console.log(`❌ Missing: ${file.source}`);
  }
});

// Create deployment instructions
const instructions = `# 🚀 Settings Feature - Production Deployment

## 📂 Files to Upload

Upload these files to your production server:

### 1. Backend Files
- Upload \`backend/routes/settings.js\` to \`public_html/backend/routes/settings.js\`
- Upload \`backend/server.js\` to \`public_html/backend/server.js\`

### 2. Database Update
Run the SQL from \`PRODUCTION_DATABASE_UPDATE.sql\` in your production MySQL database.

## 🔧 Deployment Steps

### Step 1: Upload Files via cPanel File Manager
1. Navigate to \`public_html/backend/routes/\`
2. Upload \`settings.js\`
3. Navigate to \`public_html/backend/\`
4. Upload \`server.js\` (replace existing)

### Step 2: Update Database
1. Login to phpMyAdmin or MySQL in cPanel
2. Select database: \`khumocob_aja\`
3. Run the SQL from \`PRODUCTION_DATABASE_UPDATE.sql\`

### Step 3: Restart Backend
1. Access cPanel Terminal
2. Navigate to backend: \`cd public_html/backend\`
3. Stop existing process: \`killall node\`
4. Start new process: \`node server.js\`

### Step 4: Test
1. Go to: https://aja.khumo.co.bw/settings
2. Settings should load without "Route not found" error
3. Theme switching should work instantly

## ✅ Expected Result

After deployment:
- Settings page loads successfully
- No more 404 errors
- Theme changes work immediately  
- All settings save/load properly

## 🚨 If Issues Persist

Check backend logs:
\`\`\`bash
cd public_html/backend
node server.js
\`\`\`

Look for:
- Database connection errors
- Route registration messages
- Port conflicts

## 📝 Backup Reminder

Before uploading, backup your current \`server.js\` file in case you need to rollback.
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT-INSTRUCTIONS.md'), instructions);

console.log('✅ Settings deployment package ready!');
console.log('📁 Location: ./settings-deployment/');
console.log('📋 Next: Follow DEPLOYMENT-INSTRUCTIONS.md');



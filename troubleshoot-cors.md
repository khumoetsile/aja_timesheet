# 🔧 CORS Troubleshooting Guide

## 🚨 Current Issue
Backend is still returning `http://aja.khumo.co.bw` instead of `https://aja.khumo.co.bw` in CORS headers.

## 🔍 Step-by-Step Troubleshooting

### Step 1: Verify File Upload
1. **Check if files were uploaded correctly:**
   ```bash
   # On your server, check the contents of server.js
   cat /path/to/your/backend/server.js | grep "aja.khumo.co.bw"
   ```
   Should show: `origin: process.env.FRONTEND_URL || 'https://aja.khumo.co.bw'`

### Step 2: Check Environment Variables
1. **Verify .env file exists and has correct values:**
   ```bash
   # Check if .env file exists
   ls -la /path/to/your/backend/.env
   
   # View .env contents
   cat /path/to/your/backend/.env | grep FRONTEND_URL
   ```
   Should show: `FRONTEND_URL=https://aja.khumo.co.bw`

### Step 3: Regenerate .env File
If the .env file is missing or incorrect:
```bash
cd /path/to/your/backend
node setup-env.js
```

### Step 4: Force Restart Backend
1. **Kill all Node.js processes:**
   ```bash
   pkill -f node
   pkill -f server.js
   ```

2. **Check if any processes are still running:**
   ```bash
   ps aux | grep node
   ```

3. **Start fresh:**
   ```bash
   cd /path/to/your/backend
   node server.js
   ```

### Step 5: Test Backend CORS
1. **Test the health endpoint:**
   ```bash
   curl -H "Origin: https://aja.khumo.co.bw" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://ajabackend.khumo.co.bw/api/auth/login
   ```

2. **Check response headers:**
   Look for: `Access-Control-Allow-Origin: https://aja.khumo.co.bw`

### Step 6: Alternative CORS Configuration
If the issue persists, try this more permissive CORS setup:

```javascript
// In server.js, replace the CORS configuration with:
app.use(cors({
  origin: ['https://aja.khumo.co.bw', 'http://aja.khumo.co.bw'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 7: Check for Caching
1. **Clear any proxy caches:**
   ```bash
   # If using nginx
   sudo nginx -s reload
   
   # If using Apache
   sudo systemctl reload apache2
   ```

2. **Check if there's a reverse proxy:**
   ```bash
   # Check if nginx is running
   sudo systemctl status nginx
   
   # Check if Apache is running
   sudo systemctl status apache2
   ```

### Step 8: Verify SSL Certificate
1. **Test SSL connection:**
   ```bash
   curl -I https://ajabackend.khumo.co.bw/health
   ```

2. **Check certificate validity:**
   ```bash
   openssl s_client -connect ajabackend.khumo.co.bw:443 -servername ajabackend.khumo.co.bw
   ```

## 🎯 Quick Fix Commands

Run these commands on your server:

```bash
# 1. Navigate to backend directory
cd /path/to/your/backend

# 2. Kill all Node processes
pkill -f node

# 3. Regenerate .env file
node setup-env.js

# 4. Start server
node server.js

# 5. Test in another terminal
curl -H "Origin: https://aja.khumo.co.bw" \
     -X OPTIONS \
     https://ajabackend.khumo.co.bw/api/auth/login
```

## 🔍 Debug Information

If the issue persists, run this debug script:
```bash
cd /path/to/your/backend
node debug-cors.js
```

## 📞 Common Solutions

1. **Server not restarted properly** → Kill all processes and restart
2. **Wrong .env file** → Regenerate with `node setup-env.js`
3. **Cached configuration** → Clear proxy caches
4. **Multiple server instances** → Kill all Node processes
5. **SSL certificate issues** → Check certificate validity

## ✅ Success Indicators

- `Access-Control-Allow-Origin: https://aja.khumo.co.bw` in response headers
- No CORS errors in browser console
- Login works without errors
- Dashboard loads data successfully 
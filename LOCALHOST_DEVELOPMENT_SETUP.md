# Localhost Development Setup

## Overview
The application has been configured to use localhost for development instead of the production backend. This allows you to develop and test the analytics functionality locally.

## Configuration Changes Made

### 1. Development Environment (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  // Point dev to local backend for development
  apiUrl: 'http://localhost:3001/api'
};
```

### 2. Development-Specific Environment (`src/environments/environment.development.ts`)
```typescript
export const environment = {
  production: false,
  // Point dev to local backend for development
  apiUrl: 'http://localhost:3001/api'
};
```

### 3. Production Environment (`src/environments/environment.production.ts`)
```typescript
export const environment = {
  production: true,
  // Production should use the production API
  apiUrl: 'https://ajabackend.khumo.co.bw/api'
};
```

## How to Use

### Development Mode (Localhost)
```bash
# This will use localhost:3001
ng serve --configuration development
```

### Production Mode (Remote Backend)
```bash
# This will use the production backend
ng serve --configuration production
```

### Build for Development
```bash
ng build --configuration development
```

### Build for Production
```bash
ng build --configuration production
```

## Backend Setup Required

To use the analytics functionality locally, you need to:

### 1. Start Local Backend
```bash
cd backend
npm start
# or
node server.js
```

### 2. Ensure Backend Runs on Port 3001
The backend should be configured to run on `http://localhost:3001`

### 3. Implement Analytics APIs
The local backend needs to implement these endpoints:
- `GET /api/analytics/time-analytics`
- `GET /api/analytics/department-analytics`
- `GET /api/analytics/user-analytics`
- `GET /api/analytics/time-trends`
- `GET /api/analytics/project-analytics`
- `GET /api/analytics/custom-reports`
- `POST /api/analytics/custom-reports`
- `PUT /api/analytics/custom-reports/:id`
- `DELETE /api/analytics/custom-reports/:id`
- `POST /api/analytics/custom-reports/:id/schedule`
- `GET /api/analytics/real-time-dashboard`
- `GET /api/analytics/kpi-metrics`
- `POST /api/analytics/export`

## Benefits of Local Development

1. **Faster Development**: No network latency
2. **Easier Debugging**: Direct access to backend logs
3. **Isolated Testing**: Test analytics without affecting production data
4. **Quick Iteration**: Make changes and test immediately

## Switching Back to Production

When you're ready to deploy:

1. **Build for production**:
   ```bash
   ng build --configuration production
   ```

2. **The production build will automatically use**:
   - `https://ajabackend.khumo.co.bw/api`

## Current Status

✅ **Frontend**: Configured for localhost development  
✅ **Build**: Development configuration compiles successfully  
🔄 **Backend**: Needs analytics APIs implemented locally  
🔄 **Testing**: Ready to test once local backend is running  

## Next Steps

1. **Start your local backend** on port 3000
2. **Implement the analytics API endpoints** (see `BACKEND_ANALYTICS_API_IMPLEMENTATION.md`)
3. **Test the analytics functionality** locally
4. **Deploy to production** when ready

The frontend is now properly configured for local development while maintaining the ability to easily switch back to production when needed.

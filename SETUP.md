# AJA Law Firm Timesheet System - Setup Guide

This guide will help you set up the complete AJA Law Firm Timesheet Management System with role-based authentication.

## Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Git**

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

Edit the `.env` file with your database credentials:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aja_timesheet
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:4200
```

```bash
# Run database setup
npm run setup

# Start the backend server
npm run dev
```

The backend will be running at `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start the frontend
ng serve
```

The frontend will be running at `http://localhost:4200`

## Default Users

The system comes with three default users for testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@aja.com | admin123 | Full system access |
| **Supervisor** | supervisor@aja.com | admin123 | Department management |
| **Staff** | staff@aja.com | admin123 | Basic timesheet access |

## Role Permissions

### ADMIN
- ✅ Create, edit, and delete users
- ✅ View all timesheet entries
- ✅ Access analytics and reports
- ✅ Manage system settings
- ✅ Approve/reject timesheet entries

### SUPERVISOR
- ✅ View and manage timesheet entries
- ✅ Access analytics for their department
- ✅ Approve/reject timesheet entries
- ❌ Cannot manage users (except own profile)

### STAFF
- ✅ Create and edit own timesheet entries
- ✅ View own entries and basic reports
- ❌ Cannot access user management
- ❌ Cannot access advanced analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/users/:userId/toggle-status` - Toggle user status (Admin only)

### Health Check
- `GET /health` - API health status

## Database Schema

The system includes:
- **Users table** - User management with roles
- **Timesheet entries table** - Time tracking data
- **Departments table** - Department reference data
- **Analytics views** - Pre-built queries for reporting
- **Indexes** - Optimized for performance

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for security
- **Rate Limiting** - Prevents abuse
- **CORS Protection** - Cross-origin security
- **Input Validation** - Request validation
- **Role-based Access Control** - Permission management

## Development

### Backend Commands
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests
npm run setup    # Setup database
```

### Frontend Commands
```bash
ng serve         # Start development server
ng build         # Build for production
ng test          # Run tests
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `createdb aja_timesheet`

### CORS Issues
1. Check `FRONTEND_URL` in backend `.env`
2. Ensure frontend is running on correct port

### Authentication Issues
1. Verify JWT_SECRET is set in `.env`
2. Check token expiration (24h default)
3. Ensure user is active in database

### Port Conflicts
- Backend: Change `PORT` in `.env` (default: 3000)
- Frontend: Use `ng serve --port 4201` for different port

## Next Steps

1. **Implement Timesheet CRUD** - Add timesheet management endpoints
2. **Add Analytics** - Implement reporting and dashboard data
3. **File Upload** - Add attachment support for timesheet entries
4. **Email Notifications** - Add email alerts for approvals
5. **Advanced Reporting** - Create comprehensive analytics dashboard
6. **Testing** - Add comprehensive test suite
7. **Documentation** - Add API documentation with Swagger

## Production Deployment

### Environment Variables
- Change `JWT_SECRET` to a strong, unique key
- Set `NODE_ENV=production`
- Use strong database passwords
- Configure proper CORS origins

### Security Checklist
- [ ] Change default passwords
- [ ] Use HTTPS in production
- [ ] Set up proper database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the console logs for errors
4. Verify database connectivity

---

**AJA Law Firm Timesheet System** - Professional time tracking for legal professionals. 
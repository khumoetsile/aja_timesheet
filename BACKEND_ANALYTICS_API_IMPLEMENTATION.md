# Backend Analytics API Implementation Guide

## Overview
This document outlines the required backend API endpoints for the Analytics system. The frontend is now configured to make real HTTP calls to these endpoints.

## Required API Endpoints

### Base URL
```
/api/analytics
```

### 1. Time Analytics
**Endpoint:** `GET /api/analytics/time-analytics`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period
- `department` (optional): Filter by specific department

**Response:**
```json
{
  "totalHours": 1247.5,
  "billableHours": 1180.2,
  "nonBillableHours": 67.3,
  "averageHoursPerDay": 8.2,
  "averageHoursPerWeek": 41.0,
  "totalEntries": 152,
  "complianceRate": 87.5,
  "overtimeHours": 45.8,
  "utilizationRate": 92.3
}
```

### 2. Department Analytics
**Endpoint:** `GET /api/analytics/department-analytics`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period
- `department` (optional): Filter by specific department

**Response:**
```json
[
  {
    "department": "Engineering",
    "totalHours": 456.8,
    "averageHoursPerUser": 8.1,
    "complianceRate": 91.2,
    "userCount": 12,
    "topPerformers": ["John Smith", "Sarah Johnson", "Mike Chen"],
    "utilizationRate": 94.5
  }
]
```

### 3. User Analytics
**Endpoint:** `GET /api/analytics/user-analytics`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period
- `department` (optional): Filter by specific department

**Response:**
```json
[
  {
    "userId": "U001",
    "firstName": "John",
    "lastName": "Smith",
    "department": "Engineering",
    "totalHours": 168.5,
    "averageHoursPerDay": 8.4,
    "complianceRate": 94.2,
    "lastEntryDate": "2025-08-31T10:00:00Z",
    "totalEntries": 21,
    "utilizationRate": 96.8
  }
]
```

### 4. Time Trends
**Endpoint:** `GET /api/analytics/time-trends`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period
- `granularity`: "daily" | "weekly" | "monthly"

**Response:**
```json
[
  {
    "date": "2025-08-25",
    "totalHours": 156.8,
    "userCount": 30,
    "complianceRate": 89.2,
    "averageHoursPerUser": 5.2
  }
]
```

### 5. Project Analytics
**Endpoint:** `GET /api/analytics/project-analytics`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period

**Response:**
```json
[
  {
    "projectName": "Website Redesign",
    "totalHours": 245.6,
    "userCount": 8,
    "averageHoursPerUser": 30.7,
    "startDate": "2025-08-01T00:00:00Z",
    "endDate": "2025-09-30T00:00:00Z",
    "completionRate": 78.5
  }
]
```

### 6. Custom Reports
**Endpoint:** `GET /api/analytics/custom-reports`

**Response:**
```json
[
  {
    "id": "R001",
    "name": "Weekly Engineering Report",
    "description": "Weekly summary of engineering team performance",
    "filters": { "department": "Engineering" },
    "columns": ["firstName", "lastName", "totalHours", "complianceRate"],
    "schedule": "weekly",
    "recipients": ["engineering-manager@company.com"],
    "lastGenerated": "2025-08-28T00:00:00Z",
    "nextGeneration": "2025-09-04T00:00:00Z"
  }
]
```

### 7. Create Custom Report
**Endpoint:** `POST /api/analytics/custom-reports`

**Request Body:**
```json
{
  "name": "New Report",
  "description": "Report description",
  "filters": { "department": "Sales" },
  "columns": ["firstName", "lastName", "totalHours"],
  "schedule": "monthly",
  "recipients": ["manager@company.com"]
}
```

### 8. Update Custom Report
**Endpoint:** `PUT /api/analytics/custom-reports/:id`

**Request Body:** Same as create

### 9. Delete Custom Report
**Endpoint:** `DELETE /api/analytics/custom-reports/:id`

### 10. Schedule Report
**Endpoint:** `POST /api/analytics/custom-reports/:id/schedule`

**Request Body:**
```json
{
  "schedule": "weekly",
  "recipients": ["manager@company.com"]
}
```

### 11. Real-time Dashboard
**Endpoint:** `GET /api/analytics/real-time-dashboard`

**Response:**
```json
{
  "activeUsers": 18,
  "currentHour": 14,
  "todayTotalHours": 142.5,
  "complianceAlerts": 3,
  "systemStatus": "healthy",
  "lastUpdate": "2025-08-31T14:30:00Z"
}
```

### 12. KPI Metrics
**Endpoint:** `GET /api/analytics/kpi-metrics`

**Query Parameters:**
- `startDate` (ISO string): Start date for analytics period
- `endDate` (ISO string): End date for analytics period

**Response:**
```json
{
  "totalHours": 1247.5,
  "averageHoursPerDay": 8.2,
  "complianceRate": 87.5,
  "utilizationRate": 92.3,
  "overtimeHours": 45.8,
  "billableHours": 1180.2,
  "nonBillableHours": 67.3,
  "activeUsers": 30,
  "totalProjects": 4,
  "averageProjectCompletion": 70.9
}
```

### 13. Export Analytics
**Endpoint:** `POST /api/analytics/export`

**Query Parameters:**
- `format`: "csv" | "excel" | "pdf"
- `filename` (optional): Custom filename for export

**Request Body:** Analytics data to export

**Response:** File blob (CSV, Excel, or PDF)

## Authentication
All endpoints require authentication headers:
```
Authorization: Bearer <jwt_token>
```

## Database Schema Requirements

### Timesheet Entries Table
```sql
CREATE TABLE timesheet_entries (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  projectId VARCHAR(36),
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  description TEXT,
  isBillable BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100),
  role ENUM('USER', 'SUPERVISOR', 'ADMIN') DEFAULT 'USER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATE,
  endDate DATE,
  status ENUM('active', 'completed', 'on-hold') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Custom Reports Table
```sql
CREATE TABLE custom_reports (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  filters JSON,
  columns JSON,
  schedule ENUM('daily', 'weekly', 'monthly', 'none') DEFAULT 'none',
  recipients JSON,
  lastGenerated DATETIME,
  nextGeneration DATETIME,
  createdBy VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Implementation Priority

### Phase 1 (Critical - Basic Analytics)
1. Time Analytics
2. Department Analytics
3. User Analytics
4. KPI Metrics

### Phase 2 (Important - Advanced Features)
1. Time Trends
2. Project Analytics
3. Real-time Dashboard

### Phase 3 (Nice to Have - Reporting)
1. Custom Reports (CRUD)
2. Report Scheduling
3. Export Functionality

## Error Handling
Implement proper HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Performance Considerations
- Implement database indexing on frequently queried fields
- Use pagination for large datasets
- Consider caching for real-time dashboard data
- Implement query optimization for date range queries

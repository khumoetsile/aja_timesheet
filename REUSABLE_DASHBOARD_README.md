# Reusable Reports Dashboard Component

## Overview

The `AdminDashboardComponent` has been enhanced to be reusable for both ADMIN and SUPERVISOR roles. This eliminates code duplication and provides consistent reporting functionality across different user roles.

## Key Features

### Role-Based Behavior
- **ADMIN Role**: Full access to all departments and features
- **SUPERVISOR Role**: Automatically filtered to their assigned department
- **Conditional UI**: Department filter and department performance table only visible to admins

### Automatic Department Filtering
- Supervisors automatically see data filtered by their department
- Department filter cannot be cleared for supervisors
- All charts and metrics respect the department filter

## Usage

### For Admin Users
```typescript
// In admin routes or components
<app-admin-dashboard 
  [userRole]="'ADMIN'" 
  [userDepartment]="''">
</app-admin-dashboard>
```

### For Supervisor Users
```typescript
// In supervisor routes or components
<app-admin-dashboard 
  [userRole]="'SUPERVISOR'" 
  [userDepartment]="supervisorDepartment">
</app-admin-dashboard>
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `userRole` | `'ADMIN' \| 'SUPERVISOR'` | `'ADMIN'` | User's role to determine access level |
| `userDepartment` | `string` | `''` | User's department (required for supervisors) |

## Dynamic Content

### Headers
- **Admin**: "Reports" with "Key insights and drill-down analytics"
- **Supervisor**: "Department Reports" with "Analytics for [Department] Department"

### Tables
- **Admin**: "User Performance" and "Department Performance"
- **Supervisor**: "Team Performance" (department performance hidden)

### Filters
- **Admin**: Full access to all filters including department
- **Supervisor**: Department filter hidden, always filtered by their department

## Compliance Dashboard

The `TimesheetComplianceDashboardComponent` has also been enhanced with the same reusable pattern:

### Role-Based Behavior
- **ADMIN Role**: Full access to all departments and compliance data
- **SUPERVISOR Role**: Automatically filtered to their assigned department

### Automatic Department Filtering
- Supervisors automatically see compliance data filtered by their department
- Department filter cannot be cleared for supervisors
- All compliance metrics, charts, and tables respect the department filter

### Dynamic Content
- **Admin**: "Timesheet Compliance" with "Monitor timesheet compliance across all departments"
- **Supervisor**: "Department Compliance" with "Compliance monitoring for [Department] Department"

### Export Features
- **Admin**: Exports with filename `timesheet-compliance-[date].csv`
- **Supervisor**: Exports with filename `[Department]-compliance-[date].csv`

## Routing

### Admin Routes
- `/admin/reports` - Main reports dashboard
- `/admin/reports/detail` - Detailed report view
- `/admin/compliance` - Timesheet compliance dashboard

### Supervisor Routes
- `/supervisor/reports` - Department reports dashboard
- `/supervisor/reports/detail` - Detailed department report view
- `/supervisor/compliance` - Department compliance dashboard

## Implementation Details

### Automatic Department Filtering
```typescript
ngOnInit(): void {
  // Auto-set department filter for supervisors
  if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
    this.selectedDepartment = this.userDepartment;
  }
  // ... rest of initialization
}
```

### Data Loading with Role-Based Filters
```typescript
loadDashboardData(): void {
  // Build base filters - for supervisors, always filter by department
  const baseFilters: any = {};
  if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
    baseFilters.department = this.userDepartment;
  }
  
  // Load entries with base filters
  this.timesheetService.getAllEntries({ page: 1, limit: 1000 }, baseFilters)
    .subscribe(/* ... */);
}
```

### Filter Application
```typescript
applyFilters(): void {
  const filters: any = {};
  
  if (this.selectedDepartment) {
    filters.department = this.selectedDepartment;
  } else if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
    // Supervisors always have department filter
    filters.department = this.userDepartment;
  }
  
  // ... rest of filter logic
}
```

## Benefits

1. **Code Reuse**: Single component for both admin and supervisor dashboards
2. **Consistent UI**: Same look and feel across roles
3. **Maintainability**: Single source of truth for dashboard logic
4. **Role-Based Security**: Automatic data filtering based on user role
5. **Flexibility**: Easy to extend for additional roles or departments

## Future Enhancements

- Support for additional user roles (e.g., MANAGER, TEAM_LEAD)
- Customizable dashboard layouts per role
- Role-based chart configurations
- Department-specific metrics and KPIs

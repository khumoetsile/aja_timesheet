import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at?: string;
  timesheet_entries?: number;
}

export interface BulkSeedOptions {
  sendEmails: boolean;
  skipDuplicates: boolean;
}

export interface BulkSeedResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    created: number;
    skipped: number;
    errors: number;
    emailsSent: number;
    emailErrors: number;
    details: Array<{
      user: string;
      status: 'created' | 'skipped' | 'error';
      email?: string;
      department?: string;
      role?: string;
      emailSent?: boolean;
      error?: string;
      reason?: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersManagementService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Bulk seed users from JSON data
   */
  bulkSeedUsers(users: any[], options: BulkSeedOptions): Observable<BulkSeedResult> {
    return this.http.post<BulkSeedResult>(`${this.apiUrl}/bulk-seed`, {
      users,
      options
    }, { headers: this.getHeaders() });
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Validate user data structure
   */
  validateUserData(users: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(users)) {
      errors.push('Data must be an array of users');
      return { valid: false, errors };
    }

    if (users.length === 0) {
      errors.push('No users found in the data');
      return { valid: false, errors };
    }

    // Check required fields for each user
    users.forEach((user, index) => {
      if (!user['Email Address']) {
        errors.push(`User ${index + 1}: Missing email address`);
      }
      if (!user['Employee Name']) {
        errors.push(`User ${index + 1}: Missing employee name`);
      }
      if (!user['Role']) {
        errors.push(`User ${index + 1}: Missing role`);
      }
      
      // Validate email format
      if (user['Email Address'] && !this.isValidEmail(user['Email Address'])) {
        errors.push(`User ${index + 1}: Invalid email format (${user['Email Address']})`);
      }
      
      // Validate role
      if (user['Role'] && !['ADMIN', 'SUPERVISOR', 'STAFF'].includes(user['Role'])) {
        errors.push(`User ${index + 1}: Invalid role (${user['Role']}). Must be ADMIN, SUPERVISOR, or STAFF`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Fix common user data issues
   */
  fixUserData(users: any[]): any[] {
    const departmentMapping: { [key: string]: string } = {
      'OPS': 'Operations',
      'Corporate': 'Litigation',
      'Registry': 'Operations',
      'logistics and fleet': 'Operations'
    };

    return users.map(user => {
      const fixedUser = { ...user };
      
      // Fix empty department for ADMIN users
      if (fixedUser.Department === '' && fixedUser.Role === 'ADMIN') {
        fixedUser.Department = 'Operations';
      }
      
      // Map department names
      if (departmentMapping[fixedUser.Department]) {
        fixedUser.Department = departmentMapping[fixedUser.Department];
      }
      
      // Fix email domain
      if (fixedUser['Email Address'] && fixedUser['Email Address'].endsWith('@co.bw')) {
        fixedUser['Email Address'] = fixedUser['Email Address'].replace('@co.bw', '@aja.co.bw');
      }
      
      return fixedUser;
    });
  }

  /**
   * Get department statistics
   */
  getDepartmentStats(users: any[]): { [department: string]: number } {
    const stats: { [department: string]: number } = {};
    
    users.forEach(user => {
      const dept = user.Department || 'Unassigned';
      stats[dept] = (stats[dept] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Get role statistics
   */
  getRoleStats(users: any[]): { [role: string]: number } {
    const stats: { [role: string]: number } = {};
    
    users.forEach(user => {
      const role = user.Role || 'Unknown';
      stats[role] = (stats[role] || 0) + 1;
    });
    
    return stats;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

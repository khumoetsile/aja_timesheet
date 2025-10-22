import { Injectable } from '@angular/core';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor() { }

  /**
   * Normalize user data to handle both API response formats
   */
  normalizeUser(user: any): User {
    if (!user) return user;

    return {
      ...user,
      // Handle firstName/lastName vs first_name/last_name
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      
      // Handle isActive vs is_active
      isActive: user.isActive !== undefined ? user.isActive : user.is_active !== undefined ? user.is_active : true,
      
      // Handle date fields
      createdAt: user.createdAt || user.created_at || '',
      updatedAt: user.updatedAt || user.updated_at || '',
      lastLogin: user.lastLogin || user.last_login || null,
      
      // Ensure department is set
      department: user.department || 'General'
    };
  }

  /**
   * Get user's full name with fallback
   */
  getFullName(user: User | null): string {
    if (!user) return 'AJA User';
    
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || (user.email ? user.email.split('@')[0] : 'AJA User');
  }

  /**
   * Get user's initials for avatar
   */
  getUserInitials(user: User | null): string {
    if (!user) return 'U';
    
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial || user.email?.charAt(0).toUpperCase() || 'U';
  }

  /**
   * Get formatted role display name
   */
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'STAFF':
        return 'Staff Member';
      default:
        return role;
    }
  }

  /**
   * Get user status display
   */
  getStatusDisplay(user: User | null): { label: string; class: string } {
    if (!user) {
      return { label: 'Unknown', class: 'status-inactive' };
    }
    
    const isActive = user.isActive !== undefined ? user.isActive : user.is_active !== undefined ? user.is_active : true;
    
    return {
      label: isActive ? 'Active' : 'Inactive',
      class: isActive ? 'status-active' : 'status-inactive'
    };
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null | undefined, format: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      
      switch (format) {
        case 'short':
          return date.toLocaleDateString();
        case 'medium':
          return date.toLocaleString();
        case 'long':
          return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        default:
          return date.toLocaleString();
      }
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Get user's last activity display
   */
  getLastActivityDisplay(user: User | null): string {
    if (!user) return 'Never';
    
    const lastLogin = user.lastLogin || user.last_login;
    if (!lastLogin) return 'Never';
    
    return this.formatDate(lastLogin, 'medium');
  }

  /**
   * Check if user has required fields
   */
  isUserDataComplete(user: User | null): boolean {
    if (!user) return false;
    
    const hasName = !!(user.firstName || user.first_name) && !!(user.lastName || user.last_name);
    const hasEmail = !!user.email;
    const hasRole = !!user.role;
    const hasDepartment = !!user.department;
    
    return hasName && hasEmail && hasRole && hasDepartment;
  }

  /**
   * Get missing user data fields
   */
  getMissingFields(user: User | null): string[] {
    if (!user) return ['All user data'];
    
    const missing: string[] = [];
    
    if (!(user.firstName || user.first_name)) missing.push('First Name');
    if (!(user.lastName || user.last_name)) missing.push('Last Name');
    if (!user.email) missing.push('Email');
    if (!user.role) missing.push('Role');
    if (!user.department) missing.push('Department');
    
    return missing;
  }
}

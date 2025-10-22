import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'STAFF';
  department?: string;
  isActive?: boolean;
  is_active?: boolean;
  lastLogin?: string;
  last_login?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      map(response => {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  hasRole(role: 'ADMIN' | 'SUPERVISOR' | 'STAFF'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    switch (role) {
      case 'ADMIN':
        return user.role === 'ADMIN';
      case 'SUPERVISOR':
        return user.role === 'ADMIN' || user.role === 'SUPERVISOR';
      case 'STAFF':
        return user.role === 'ADMIN' || user.role === 'SUPERVISOR' || user.role === 'STAFF';
      default:
        return false;
    }
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isSupervisor(): boolean {
    return this.hasRole('SUPERVISOR');
  }

  isStaff(): boolean {
    return this.hasRole('STAFF');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(updates: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, updates, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: string, updates: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/users/${userId}`, updates, {
      headers: this.getAuthHeaders()
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    });
  }

  resetUserPassword(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/users/${userId}/reset-password`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{users: User[]}>(`${this.apiUrl}/auth/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.users)
    );
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/users/${userId}/toggle-status`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'STAFF';
    department: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData, {
      headers: this.getAuthHeaders()
    });
  }
} 
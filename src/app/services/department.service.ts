import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface DepartmentResponse {
  success: boolean;
  departments: Department[];
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDepartments(): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.baseUrl}/timesheet/departments`, { 
      headers: this.headers() 
    });
  }

  createDepartment(department: Partial<Department>): Observable<any> {
    return this.http.post(`${this.baseUrl}/timesheet/departments`, department, { 
      headers: this.headers() 
    });
  }

  updateDepartment(id: number, department: Partial<Department>): Observable<any> {
    return this.http.put(`${this.baseUrl}/timesheet/departments/${id}`, department, { 
      headers: this.headers() 
    });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/timesheet/departments/${id}`, { 
      headers: this.headers() 
    });
  }
}

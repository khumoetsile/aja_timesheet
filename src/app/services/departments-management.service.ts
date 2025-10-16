import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  task_count?: number;
  tasks?: Task[];
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  department_id: number;
  department_name?: string;
}

export interface DepartmentUploadData {
  departments: {
    name: string;
    description?: string;
    is_active?: boolean;
    tasks: {
      name: string;
      description?: string;
      is_active?: boolean;
    }[];
  }[];
}

export interface UploadResult {
  message: string;
  results: {
    total_departments: number;
    departments_created: number;
    departments_skipped: number;
    departments_errors: number;
    total_tasks: number;
    tasks_created: number;
    tasks_skipped: number;
    tasks_errors: number;
    details: {
      department: string;
      status: string;
      tasks_processed: number;
      error?: string;
      task_details: {
        name: string;
        status: string;
        reason?: string;
        error?: string;
      }[];
    }[];
  };
}

export interface DepartmentsResponse {
  message: string;
  departments: Department[];
  total_departments: number;
  total_tasks: number;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentsManagementService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all departments with their tasks
  getDepartments(): Observable<DepartmentsResponse> {
    return this.http.get<DepartmentsResponse>(`${this.baseUrl}/departments`, { 
      headers: this.headers() 
    });
  }

  // Get specific department with tasks
  getDepartment(id: number): Observable<{message: string, department: Department}> {
    return this.http.get<{message: string, department: Department}>(`${this.baseUrl}/departments/${id}`, { 
      headers: this.headers() 
    });
  }

  // Create new department
  createDepartment(department: {
    name: string;
    description?: string;
    is_active?: boolean;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/departments`, department, { 
      headers: this.headers() 
    });
  }

  // Update department
  updateDepartment(id: number, department: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/departments/${id}`, department, { 
      headers: this.headers() 
    });
  }

  // Delete department (soft delete)
  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/departments/${id}`, { 
      headers: this.headers() 
    });
  }

  // Bulk upload departments and tasks
  bulkUploadDepartments(data: DepartmentUploadData): Observable<UploadResult> {
    return this.http.post<UploadResult>(`${this.baseUrl}/departments/bulk-upload`, data, { 
      headers: this.headers() 
    });
  }

  // Upload JSON file
  uploadDepartmentsFile(file: File): Observable<UploadResult> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          this.bulkUploadDepartments(jsonData).subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error)
          });
        } catch (error) {
          observer.error({ message: 'Invalid JSON file format' });
        }
      };
      
      reader.onerror = () => {
        observer.error({ message: 'Error reading file' });
      };
      
      reader.readAsText(file);
    });
  }
}

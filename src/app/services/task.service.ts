import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface DepartmentTaskDto {
  id?: number;
  department: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = environment.apiUrl || '/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Fetch tasks for a department (existing endpoint in backend)
  getTasksByDepartment(department: string): Observable<{ tasks: DepartmentTaskDto[] }> {
    return this.http.get<{ tasks: DepartmentTaskDto[] }>(`${this.baseUrl}/timesheet/tasks/${encodeURIComponent(department)}`, { headers: this.headers() });
  }

  // Admin CRUD placeholders (wire when backend available)
  createTask(task: DepartmentTaskDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/timesheet/tasks`, task, { headers: this.headers() });
  }

  updateTask(id: number, task: Partial<DepartmentTaskDto>): Observable<any> {
    return this.http.put(`${this.baseUrl}/timesheet/tasks/${id}`, task, { headers: this.headers() });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/timesheet/tasks/${id}`, { headers: this.headers() });
  }
}



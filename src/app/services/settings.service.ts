import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserSettings {
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  start_time: string;
  end_time: string;
  remember_filters: boolean;
  weekly_reminder: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsResponse {
  message: string;
  settings: UserSettings;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = environment.apiUrl;
  private settingsSubject = new BehaviorSubject<UserSettings>({
    theme: 'dark',
    density: 'comfortable',
    start_time: '08:00',
    end_time: '17:00',
    remember_filters: true,
    weekly_reminder: false
  });

  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadSettings();
  }

  /**
   * Load settings from API
   */
  loadSettings(): Observable<UserSettings> {
    const headers: HttpHeaders = this.authService.getAuthHeaders();
    return this.http.get<SettingsResponse>(`${this.apiUrl}/settings`, { headers }).pipe(
      map(response => response.settings),
      tap(settings => {
        console.log('🔧 Settings loaded:', settings);
        this.settingsSubject.next(settings);
        
        // Apply theme immediately
        this.applyTheme(settings.theme);
      })
    );
  }

  /**
   * Update settings via API
   */
  updateSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    console.log('🔧 Updating settings:', settings);
    const headers: HttpHeaders = this.authService.getAuthHeaders();
    return this.http.put<SettingsResponse>(`${this.apiUrl}/settings`, settings, { headers }).pipe(
      map(response => response.settings),
      tap(updatedSettings => {
        console.log('✅ Settings updated:', updatedSettings);
        this.settingsSubject.next(updatedSettings);
        
        // Apply theme if it was changed
        if (settings.theme) {
          this.applyTheme(settings.theme);
        }
      })
    );
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): Observable<UserSettings> {
    console.log('🔧 Resetting settings to defaults');
    const headers: HttpHeaders = this.authService.getAuthHeaders();
    return this.http.delete<SettingsResponse>(`${this.apiUrl}/settings`, { headers }).pipe(
      map(response => response.settings),
      tap(defaultSettings => {
        console.log('✅ Settings reset:', defaultSettings);
        this.settingsSubject.next(defaultSettings);
        this.applyTheme(defaultSettings.theme);
      })
    );
  }

  /**
   * Get current settings synchronously
   */
  getCurrentSettings(): UserSettings {
    return this.settingsSubject.value;
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    console.log('🎨 Applying theme:', theme);
    
    // Remove existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Store in localStorage as backup
    try {
      localStorage.setItem('user_theme', theme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }

  /**
   * Load theme from localStorage (fallback)
   */
  loadThemeFromStorage(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem('user_theme');
      return (stored === 'light' || stored === 'dark') ? stored : 'dark';
    } catch (error) {
      console.warn('Could not load theme from localStorage:', error);
      return 'dark';
    }
  }

  /**
   * Check if filters should be remembered
   */
  shouldRememberFilters(): boolean {
    return this.getCurrentSettings().remember_filters;
  }

  /**
   * Get workday hours
   */
  getWorkdayHours(): { start: string; end: string } {
    const settings = this.getCurrentSettings();
    return {
      start: settings.start_time,
      end: settings.end_time
    };
  }

  /**
   * Check if weekly reminders are enabled
   */
  areRemindersEnabled(): boolean {
    return this.getCurrentSettings().weekly_reminder;
  }

  /**
   * Get UI density preference
   */
  getDensity(): 'comfortable' | 'compact' {
    return this.getCurrentSettings().density;
  }

  /**
   * Apply density to document
   */
  applyDensity(density: 'comfortable' | 'compact'): void {
    console.log('📏 Applying density:', density);
    
    // Remove existing density classes
    document.body.classList.remove('density-comfortable', 'density-compact');
    
    // Add new density class
    document.body.classList.add(`density-${density}`);
  }
}

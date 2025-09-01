import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { TimesheetEntry } from '../timesheet/models/timesheet-entry.interface';

export interface ReportFilters {
  department?: string;
  userEmail?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  billable?: boolean;
}

export interface ReportData {
  entries: TimesheetEntry[];
  metrics: {
    totalEntries: number;
    totalHours: number;
    billableHours: number;
    activeUsers: number;
    departments: number;
    averageHoursPerEntry: number;
    pendingTimesheets: number;
    tasksInProgress: number;
  };
  departmentStats: any[];
  userStats: any[];
  filters: ReportFilters;
  generatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  /**
   * Filter entries based on report filters
   */
  filterEntries(entries: TimesheetEntry[], filters: ReportFilters): TimesheetEntry[] {
    let filteredEntries = [...entries];

    // Filter by department
    if (filters.department && filters.department.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.department === filters.department
      );
    }

    // Filter by user email
    if (filters.userEmail && filters.userEmail.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.user_email === filters.userEmail
      );
    }

    // Filter by status
    if (filters.status && filters.status.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.status === filters.status
      );
    }

    // Filter by priority
    if (filters.priority && filters.priority.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.priority === filters.priority
      );
    }

    // Filter by billable
    if (filters.billable !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.billable === filters.billable
      );
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateFrom.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.date >= filters.dateFrom!
      );
    }

    if (filters.dateTo && filters.dateTo.trim() !== '') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.date <= filters.dateTo!
      );
    }

    return filteredEntries;
  }

  /**
   * Calculate metrics from filtered entries
   */
  calculateMetrics(entries: TimesheetEntry[]): any {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalHours: 0,
        billableHours: 0,
        activeUsers: 0,
        departments: 0,
        averageHoursPerEntry: 0,
        pendingTimesheets: 0,
        tasksInProgress: 0
      };
    }

    const uniqueUsers = new Set(entries.map(entry => entry.user_email));
    const uniqueDepartments = new Set(entries.map(entry => entry.department));
    
    const totalHours = entries.reduce((sum, entry) => 
      sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0
    );
    
    const billableHours = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => 
        sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0
      );

    const pendingTimesheets = entries.filter(entry => entry.status === 'NotStarted').length;
    const tasksInProgress = entries.filter(entry => entry.status === 'CarriedOut').length;

    return {
      totalEntries: entries.length,
      totalHours: totalHours,
      billableHours: billableHours,
      activeUsers: uniqueUsers.size,
      departments: uniqueDepartments.size,
      averageHoursPerEntry: totalHours / entries.length,
      pendingTimesheets: pendingTimesheets,
      tasksInProgress: tasksInProgress
    };
  }

  /**
   * Calculate department stats from filtered entries
   */
  calculateDepartmentStats(entries: TimesheetEntry[]): any[] {
    if (entries.length === 0) return [];

    const deptMap = new Map<string, any>();

    entries.forEach(entry => {
      if (!deptMap.has(entry.department)) {
        deptMap.set(entry.department, {
          department: entry.department,
          totalEntries: 0,
          totalHours: 0,
          billableHours: 0,
          completedTasks: 0,
          totalTasks: 0
        });
      }

      const dept = deptMap.get(entry.department);
      dept.totalEntries++;
      dept.totalHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
      if (entry.billable) {
        dept.billableHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
      }
      dept.totalTasks++;
      if (entry.status === 'Completed') {
        dept.completedTasks++;
      }
    });

    return Array.from(deptMap.values()).map(dept => ({
      ...dept,
      averageHours: dept.totalHours / dept.totalEntries,
      completionRate: (dept.completedTasks / dept.totalTasks) * 100,
      utilization: (dept.totalHours / (dept.totalEntries * 8)) * 100 // Assuming 8-hour workday
    }));
  }

  /**
   * Calculate user stats from filtered entries
   */
  calculateUserStats(entries: TimesheetEntry[]): any[] {
    if (entries.length === 0) return [];

    const userMap = new Map<string, any>();

    entries.forEach(entry => {
      const userEmail = entry.user_email;
      if (userEmail && !userMap.has(userEmail)) {
        userMap.set(userEmail, {
          userId: entry.user_id,
          userName: `${entry.user_first_name} ${entry.user_last_name}`,
          userEmail: userEmail,
          totalEntries: 0,
          totalHours: 0,
          billableHours: 0,
          lastActivity: entry.date
        });
      }

            if (userEmail) {
        const user = userMap.get(userEmail);
        if (user) {
          user.totalEntries++;
          user.totalHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
          if (entry.billable) {
            user.billableHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
          }
          if (entry.date > user.lastActivity) {
            user.lastActivity = entry.date;
          }
        }
      }
    });

    return Array.from(userMap.values()).map(user => ({
      ...user,
      averageHours: user.totalHours / user.totalEntries,
      utilization: (user.totalHours / (user.totalEntries * 8)) * 100 // Assuming 8-hour workday
    }));
  }

  /**
   * Generate PDF Report
   */
  async generatePDFReport(reportData: ReportData, elementId: string): Promise<void> {
    try {
      // Create a temporary report element with filtered data
      const reportElement = this.createReportElement(reportData);

      // Removed: extra prepended Applied Filters summary to avoid duplicate box at the very top
      // The template already includes a single Applied Filters section in the right place

      // Lighten typography globally inside the report element
      reportElement.style.setProperty('--pdf-heading-weight', '600');
      reportElement.style.setProperty('--pdf-label-weight', '500');
      reportElement.style.setProperty('--pdf-body-weight', '400');

      document.body.appendChild(reportElement);

      const canvas = await html2canvas(reportElement, {
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // PDF page size (mm)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm

      // Draw width in mm and scale factor (mm per px)
      const drawWidthMm = pageWidth - margin * 2;
      const mmPerPx = drawWidthMm / canvas.width;

      // Available height per page converted to source pixels
      const availableHeightMm = pageHeight - margin * 2;
      const pageHeightPx = Math.floor(availableHeightMm / mmPerPx);

      // Slice the canvas in pixel units to avoid scaling issues
      let remainingPx = canvas.height;
      let pageIndex = 0;
      while (remainingPx > 0) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        const sliceStart = pageIndex * pageHeightPx;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pageHeightPx, remainingPx);
        const sliceCtx = sliceCanvas.getContext('2d')!;
        sliceCtx.drawImage(canvas, 0, sliceStart, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);

        const sliceImgData = sliceCanvas.toDataURL('image/png');
        pdf.addImage(sliceImgData, 'PNG', margin, margin, drawWidthMm, sliceCanvas.height * mmPerPx);

        remainingPx -= pageHeightPx;
        pageIndex++;
      }

      pdf.save('report.pdf');

      // Clean up
      document.body.removeChild(reportElement);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  }

    private createReportElement(reportData: ReportData): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 700px;
      background: #ffffff;
      padding: 24px;
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';
      line-height: 1.45;
      color: #111827; /* slate-900 */
      box-shadow: 0 0 20px rgba(0,0,0,0.08);
    `;

    element.innerHTML = `
      <!-- AJA Brand Header -->
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        <div style="margin-bottom: 6px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: var(--pdf-heading-weight,600); letter-spacing: 0.3px;">AJA LAW OFFICES</h1>
          <div style="width: 48px; height: 2px; background: #64748b; margin: 8px auto; border-radius: 1px;"></div>
        </div>
        <h2 style="color: #334155; margin: 0 0 4px 0; font-size: 14px; font-weight: var(--pdf-label-weight,500); text-transform: uppercase; letter-spacing: 0.6px;">Timesheet Report</h2>
        <div style="color: #6b7280; font-size: 10px; line-height: 1.4; font-weight: var(--pdf-body-weight,400);">
          <p style="margin: 1px 0;">Generated from AJA's Timesheet Application</p>
          <p style="margin: 1px 0;">Report Generated: ${reportData.generatedAt.toLocaleString()}</p>
        </div>
      </div>

      <!-- Executive Summary -->
      <div style="margin-bottom: 22px;">
        <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px; font-weight: var(--pdf-heading-weight,600); border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">Executive Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="background: #0ea5e9; color: white; padding: 10px; border-radius: 8px; text-align: center; box-shadow: 0 1px 4px rgba(14,165,233,0.25);">
            <div style="font-size: 11px; font-weight: var(--pdf-label-weight,500); opacity: 0.95; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Total Entries</div>
            <div style="font-size: 20px; font-weight: 600; margin: 0;">${reportData.metrics.totalEntries}</div>
          </div>
          <div style="background: #10b981; color: white; padding: 10px; border-radius: 8px; text-align: center; box-shadow: 0 1px 4px rgba(16,185,129,0.25);">
            <div style="font-size: 11px; font-weight: var(--pdf-label-weight,500); opacity: 0.95; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Total Hours</div>
            <div style="font-size: 20px; font-weight: 600; margin: 0;">${reportData.metrics.totalHours.toFixed(2)}</div>
          </div>
          <div style="background: #ef4444; color: white; padding: 10px; border-radius: 8px; text-align: center; box-shadow: 0 1px 4px rgba(239,68,68,0.25);">
            <div style="font-size: 11px; font-weight: var(--pdf-label-weight,500); opacity: 0.95; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Billable Hours</div>
            <div style="font-size: 20px; font-weight: 600; margin: 0;">${reportData.metrics.billableHours.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- Applied Filters -->
      <div style="margin-bottom: 16px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px; font-weight: var(--pdf-heading-weight,600); border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">Applied Filters</h3>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border-left: 3px solid #1e3a8a; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
          ${this.formatFiltersForDisplay(reportData.filters)}
        </div>
      </div>

      <!-- Charts Section -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 14px; font-weight: var(--pdf-heading-weight,600); border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">Performance Analytics</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <!-- Department Distribution Chart -->
          <div style="background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 12px; font-weight: var(--pdf-label-weight,500); text-align: center;">Department Distribution</h4>
            <div style="height: 140px; display: flex; align-items: end; justify-content: space-around; padding: 8px;">
              ${reportData.departmentStats.map((stat, index) => {
                const colors = ['#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
                const max = Math.max(1, ...reportData.departmentStats.map(s => s.totalHours));
                const height = (stat.totalHours / max) * 100;
                return `
                  <div style="text-align: center;">
                    <div style="
                      width: 26px;
                      height: ${height}px;
                      background: ${colors[index % colors.length]};
                      border-radius: 4px 4px 0 0;
                      margin: 0 auto 4px auto;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    "></div>
                    <div style="font-size: 10px; color: #6b7280; font-weight: var(--pdf-label-weight,500);">${stat.department}</div>
                    <div style="font-size: 9px; color: #94a3b8;">${stat.totalHours.toFixed(1)}h</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <!-- Status Distribution Chart -->
          <div style="background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 12px; font-weight: var(--pdf-label-weight,500); text-align: center;">Status Distribution</h4>
            <div style="height: 140px; display: flex; align-items: center; justify-content: center;">
              <div style="position: relative; width: 110px; height: 110px;">
                ${this.createStatusPieChart(reportData.entries)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Performance -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px; font-weight: var(--pdf-heading-weight,600); border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">Department Performance</h3>
        <div style="overflow-x: auto; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #1e3a8a; color: #ffffff;">
                <th style="padding: 10px 8px; text-align: left; font-weight: var(--pdf-label-weight,500); border: none;">Department</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Entries</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Total Hours</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Billable Hours</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Utilization</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.departmentStats.map((stat, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 9px 8px; border: none; color: #111827; font-weight: var(--pdf-body-weight,400);">${stat.department}</td>
                  <td style="padding: 9px 8px; text-align: center; border: none; color: #334155;">${stat.totalEntries}</td>
                  <td style="padding: 9px 8px; text-align: center; border: none; color: #334155;">${stat.totalHours.toFixed(2)}</td>
                  <td style="padding: 9px 8px; text-align: center; border: none; color: #334155;">${stat.billableHours.toFixed(2)}</td>
                  <td style="padding: 9px 8px; text-align: center; border: none; color: #334155;">${stat.utilization.toFixed(2)}%</td>
                  <td style="padding: 9px 8px; text-align: center; border: none; color: #334155;">${stat.completionRate.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Timesheet Entries -->
      <div style="margin-bottom: 16px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px; font-weight: var(--pdf-heading-weight,600); border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">Timesheet Entries</h3>
        <div style="overflow-x: auto; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #1e3a8a; color: #ffffff;">
                <th style="padding: 9px 6px; text-align: left; font-weight: var(--pdf-label-weight,500); border: none;">Date</th>
                <th style="padding: 9px 6px; text-align: left; font-weight: var(--pdf-label-weight,500); border: none;">Employee</th>
                <th style="padding: 9px 6px; text-align: left; font-weight: var(--pdf-label-weight,500); border: none;">Department</th>
                <th style="padding: 9px 6px; text-align: left; font-weight: var(--pdf-label-weight,500); border: none;">Task</th>
                <th style="padding: 9px 6px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Hours</th>
                <th style="padding: 9px 6px; text-align: center; font-weight: var(--pdf-label-weight,500); border: none;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.entries.map((entry, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 8px 6px; border: none; color: #111827;">${new Date(entry.date).toLocaleDateString()}</td>
                  <td style="padding: 8px 6px; border: none; color: #111827; font-weight: var(--pdf-body-weight,400);">${entry.user_first_name} ${entry.user_last_name}</td>
                  <td style="padding: 8px 6px; border: none; color: #334155;">${entry.department}</td>
                  <td style="padding: 8px 6px; border: none; color: #334155;">${entry.task}</td>
                  <td style="padding: 8px 6px; text-align: center; border: none; color: #334155; font-weight: var(--pdf-label-weight,500);">${entry.total_hours}</td>
                  <td style="padding: 8px 6px; text-align: center; border: none;">
                    <span style="
                      padding: 3px 6px;
                      border-radius: 9999px;
                      font-size: 9px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                      border: 1px solid rgba(0,0,0,0.06);
                      ${entry.status === 'Completed' ? 'background:#e6f4ea; color:#166534;' : ''}
                      ${entry.status === 'CarriedOut' ? 'background:#fef3c7; color:#92400e;' : ''}
                      ${entry.status === 'NotStarted' ? 'background:#fee2e2; color:#991b1b;' : ''}
                    ">${entry.status === 'CarriedOut' ? 'In Progress' : (entry.status === 'NotStarted' ? 'Not Started' : entry.status)}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- AJA Brand Footer -->
      <div style="margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 10px;">
        <div style="margin-bottom: 4px;">
          <p style="margin: 2px 0; font-weight: var(--pdf-label-weight,500); text-transform: uppercase; letter-spacing: 0.4px; color: #1e3a8a;">AJA Law Offices</p>
          <p style="margin: 2px 0;">Professional Timesheet Management System</p>
        </div>
        <div style="width: 30px; height: 1px; background: #64748b; margin: 4px auto;"></div>
        <p style="margin: 2px 0; font-style: italic;">Report generated on ${reportData.generatedAt.toLocaleDateString()} at ${reportData.generatedAt.toLocaleTimeString()}</p>
      </div>
    `;

    return element;
  }

  /**
   * Generate Excel Report
   */
  generateExcelReport(reportData: ReportData): void {
    try {
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['AJA Law Offices - Timesheet Report'],
        ['Generated from AJA\'s Timesheet Application'],
        [''],
        ['Report Generated:', reportData.generatedAt.toLocaleString()],
        [''],
        ['Summary Metrics'],
        ['Total Entries', reportData.metrics.totalEntries],
        ['Total Hours', reportData.metrics.totalHours.toFixed(2)],
        ['Billable Hours', reportData.metrics.billableHours.toFixed(2)],
        ['Active Users', reportData.metrics.activeUsers],
        ['Departments', reportData.metrics.departments],
        ['Average Hours/Entry', reportData.metrics.averageHoursPerEntry.toFixed(2)],
        ['Pending Tasks', reportData.metrics.pendingTimesheets],
        ['Tasks In Progress', reportData.metrics.tasksInProgress],
        [''],
        ['Applied Filters'],
        ['Department', reportData.filters.department || 'All'],
        ['Employee', reportData.filters.userEmail || 'All'],
        ['Status', reportData.filters.status || 'All'],
        ['Date From', reportData.filters.dateFrom || 'All'],
        ['Date To', reportData.filters.dateTo || 'All']
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Entries Sheet
      const entriesData = reportData.entries.map(entry => [
        entry.date,
        entry.user_first_name + ' ' + entry.user_last_name,
        entry.user_email,
        entry.department,
        entry.task,
        entry.activity,
        entry.priority,
        entry.status,
        entry.total_hours,
        entry.billable ? 'Yes' : 'No',
        entry.start_time,
        entry.end_time,
        entry.comments || ''
      ]);

      const entriesHeaders = [
        'Date', 'Employee', 'Email', 'Department', 'Task', 'Activity',
        'Priority', 'Status', 'Hours', 'Billable', 'Start Time', 'End Time', 'Comments'
      ];

      const entriesSheet = XLSX.utils.aoa_to_sheet([entriesHeaders, ...entriesData]);
      XLSX.utils.book_append_sheet(workbook, entriesSheet, 'Timesheet Entries');

      // Department Stats Sheet
      const deptData = reportData.departmentStats.map(stat => [
        stat.department,
        stat.totalEntries,
        stat.totalHours.toFixed(2),
        stat.billableHours.toFixed(2),
        stat.utilization.toFixed(2) + '%',
        stat.completionRate.toFixed(2) + '%'
      ]);

      const deptHeaders = ['Department', 'Entries', 'Total Hours', 'Billable Hours', 'Utilization', 'Completion Rate'];
      const deptSheet = XLSX.utils.aoa_to_sheet([deptHeaders, ...deptData]);
      XLSX.utils.book_append_sheet(workbook, deptSheet, 'Department Stats');

      // User Stats Sheet
      const userData = reportData.userStats.map(stat => [
        stat.userName,
        stat.userEmail,
        stat.totalEntries,
        stat.totalHours.toFixed(2),
        stat.billableHours.toFixed(2),
        stat.utilization.toFixed(2) + '%',
        stat.lastActivity
      ]);

      const userHeaders = ['User', 'Email', 'Entries', 'Total Hours', 'Billable Hours', 'Utilization', 'Last Activity'];
      const userSheet = XLSX.utils.aoa_to_sheet([userHeaders, ...userData]);
      XLSX.utils.book_append_sheet(workbook, userSheet, 'User Stats');

      // Save the file
      const fileName = `AJA_Timesheet_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw error;
    }
  }

  /**
   * Generate CSV Report
   */
  generateCSVReport(reportData: ReportData): void {
    try {
      const headers = [
        'Date', 'Employee', 'Email', 'Department', 'Task', 'Activity',
        'Priority', 'Status', 'Hours', 'Billable', 'Start Time', 'End Time', 'Comments'
      ];

      const csvData = reportData.entries.map(entry => [
        entry.date,
        entry.user_first_name + ' ' + entry.user_last_name,
        entry.user_email,
        entry.department,
        entry.task,
        entry.activity,
        entry.priority,
        entry.status,
        entry.total_hours,
        entry.billable ? 'Yes' : 'No',
        entry.start_time,
        entry.end_time,
        entry.comments || ''
      ]);

      const csvContent = [
        'AJA Law Offices - Timesheet Report',
        'Generated from AJA\'s Timesheet Application',
        `Report Generated: ${reportData.generatedAt.toLocaleString()}`,
        '',
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AJA_Timesheet_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating CSV report:', error);
      throw error;
    }
  }

  /**
   * Generate Report Data Object with proper filtering
   */
  createReportData(
    allEntries: TimesheetEntry[],
    filters: ReportFilters
  ): ReportData {
    // Use the entries as-is since they're already filtered by the backend
    const entries = allEntries;
    
    // Calculate metrics from the data
    const metrics = this.calculateMetrics(entries);
    
    // Calculate stats from the data
    const departmentStats = this.calculateDepartmentStats(entries);
    const userStats = this.calculateUserStats(entries);

    return {
      entries: entries,
      metrics,
      departmentStats,
      userStats,
      filters,
      generatedAt: new Date()
    };
  }

  /**
   * Format Report Filters for Display
   */
  formatFilters(filters: ReportFilters): string {
    const activeFilters = [];
    
    if (filters.department) activeFilters.push(`Department: ${filters.department}`);
    if (filters.userEmail) activeFilters.push(`Employee: ${filters.userEmail}`);
    if (filters.status) activeFilters.push(`Status: ${filters.status}`);
    if (filters.dateFrom) activeFilters.push(`From: ${filters.dateFrom}`);
    if (filters.dateTo) activeFilters.push(`To: ${filters.dateTo}`);
    if (filters.priority) activeFilters.push(`Priority: ${filters.priority}`);
    if (filters.billable !== undefined) activeFilters.push(`Billable: ${filters.billable ? 'Yes' : 'No'}`);

    return activeFilters.length > 0 ? activeFilters.join(', ') : 'All Data';
  }

  /**
   * Format Report Filters for HTML Display
   */
  private formatFiltersForDisplay(filters?: ReportFilters): string {
    if (!filters) {
      return `<div style="color:#6b7280; font-style: italic;">No filters applied - All data included</div>`;
    }

    const rows: string[] = [];
    const push = (label: string, value?: string | boolean) => {
      if (value === undefined || value === null || value === '') return;
      rows.push(`<div><strong style='font-weight:500'>${label}:</strong> ${String(value)}</div>`);
    };

    push('Department', filters.department);
    push('User', filters.userEmail);
    push('Status', filters.status);
    push('Priority', filters.priority);
    if (filters.billable !== undefined) push('Billable Only', filters.billable ? 'Yes' : 'No');
    push('From', filters.dateFrom);
    push('To', filters.dateTo);

    if (rows.length === 0) {
      return `<div style="color:#6b7280; font-style: italic;">No filters applied - All data included</div>`;
    }

    return `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap:6px 12px; font-weight:400; color:#374151;">${rows.join('')}</div>`;
  }

  /**
   * Create Status Pie Chart HTML
   */
  private createStatusPieChart(entries: TimesheetEntry[]): string {
    const statusCounts = {
      Completed: entries.filter(e => e.status === 'Completed').length,
      CarriedOut: entries.filter(e => e.status === 'CarriedOut').length,
      NotStarted: entries.filter(e => e.status === 'NotStarted').length
    };

    const total = entries.length;
    if (total === 0) {
      return '<div style="text-align: center; color: #6b7280; font-size: 12px;">No data available</div>';
    }

    const colors = ['#059669', '#f59e0b', '#dc2626'];
    const statuses = ['Completed', 'CarriedOut', 'NotStarted'];
    
    let currentAngle = 0;
    const centerX = 55;
    const centerY = 55;
    const radius = 45;

    const pieSegments = statuses.map((status, index) => {
      const percentage = statusCounts[status as keyof typeof statusCounts] / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      if (percentage === 0) return '';

      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (currentAngle - 90) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      return `
        <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
              fill="${colors[index]}" 
              stroke="white" 
              stroke-width="2"/>
      `;
    }).join('');

    return `
      <svg width="110" height="110" viewBox="0 0 110 110">
        ${pieSegments}
        <circle cx="${centerX}" cy="${centerY}" r="12" fill="white"/>
      </svg>
    `;
  }
}

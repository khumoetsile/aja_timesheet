import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TimesheetTableComponent } from './timesheet-table.component';
import { TimesheetService } from '../services/timesheet.service';

describe('TimesheetTableComponent', () => {
  let component: TimesheetTableComponent;
  let fixture: ComponentFixture<TimesheetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimesheetTableComponent,
        NoopAnimationsModule,
        MatDialogModule,
        MatSnackBarModule
      ],
      providers: [TimesheetService]
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have displayed columns', () => {
    expect(component.displayedColumns).toContain('date');
    expect(component.displayedColumns).toContain('clientFileNumber');
    expect(component.displayedColumns).toContain('department');
    expect(component.displayedColumns).toContain('task');
    expect(component.displayedColumns).toContain('priority');
    expect(component.displayedColumns).toContain('startTime');
    expect(component.displayedColumns).toContain('endTime');
    expect(component.displayedColumns).toContain('totalHours');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('billable');
    expect(component.displayedColumns).toContain('actions');
  });
}); 
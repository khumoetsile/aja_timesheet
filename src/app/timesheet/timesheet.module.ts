import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetTableComponent } from './components/timesheet-table.component';

const routes: Routes = [
  { path: '', component: TimesheetTableComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetModule { } 
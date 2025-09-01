export interface TimesheetEntry {
  id?: string;
  date: string;
  client_file_number: string;
  department: string;
  task: string;
  activity: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_time: string;
  end_time: string;
  status: 'Completed' | 'CarriedOut' | 'NotStarted';
  billable: boolean | number | string;
  comments?: string;
  total_hours?: number | string;
  created_at?: string;
  updated_at?: string;
  // User information (for admin/supervisor views)
  user_id?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
} 
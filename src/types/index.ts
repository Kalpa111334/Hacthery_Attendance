export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'present' | 'late' | 'absent';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
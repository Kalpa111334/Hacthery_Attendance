import { User, AttendanceRecord } from '../types';

export const generateMockData = () => {
  const users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      department: 'Management',
      joinDate: '2024-01-01',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'employee',
      department: 'Engineering',
      joinDate: '2024-02-15',
    },
  ];

  localStorage.setItem('users', JSON.stringify(users));
  
  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify([]));
  }
};

export const getLocalStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setLocalStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
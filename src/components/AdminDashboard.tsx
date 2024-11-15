import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../types';
import { getLocalStorage, setLocalStorage } from '../utils/mockData';
import { Download, UserMinus, UserPlus, Users, X } from 'lucide-react';
import EmployeeRegistrationForm from './EmployeeRegistrationForm';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const users = getLocalStorage<User>('users').filter(u => u.role === 'employee');
    const records = getLocalStorage<AttendanceRecord>('attendance');
    setEmployees(users);
    setAttendance(records);
  }, []);

  const removeEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setLocalStorage('users', [...updatedEmployees, user]);
    setEmployees(updatedEmployees);
  };

  const downloadReport = () => {
    const records = attendance.filter(record => 
      record.date === selectedDate
    );

    const csvContent = [
      ['Date', 'Employee ID', 'Check In', 'Check Out', 'Status'].join(','),
      ...records.map(record => 
        [record.date, record.userId, record.checkIn, record.checkOut || '', record.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
  };

  const handleEmployeeAdded = () => {
    const users = getLocalStorage<User>('users').filter(u => u.role === 'employee');
    setEmployees(users);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Admin Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">{user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                New Employee
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <button
                onClick={downloadReport}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const todayAttendance = attendance.find(
                    record => record.userId === employee.id && record.date === selectedDate
                  );
                  
                  return (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.joinDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${todayAttendance ? 
                            todayAttendance.status === 'present' ? 'bg-green-100 text-green-800' :
                            todayAttendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'}`}>
                          {todayAttendance ? todayAttendance.status : 'Not Marked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto max-w-md">
            <div className="relative bg-white rounded-lg shadow">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6">
                <EmployeeRegistrationForm onSuccess={handleEmployeeAdded} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
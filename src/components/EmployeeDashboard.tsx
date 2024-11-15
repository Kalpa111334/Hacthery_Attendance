import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../types';
import { getLocalStorage, setLocalStorage } from '../utils/mockData';
import { Clock, LogIn, LogOut } from 'lucide-react';
import NotificationService from '../services/notificationService';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const records = getLocalStorage<AttendanceRecord>('attendance');
    setAttendance(records);
    
    const today = new Date().toISOString().split('T')[0];
    const todayRec = records.find(
      record => record.userId === user.id && record.date === today
    );
    setTodayRecord(todayRec || null);
  }, [user.id]);

  const handleCheckIn = async () => {
    const now = new Date();
    const isLate = now.getHours() >= 9;
    
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: user.id,
      date: now.toISOString().split('T')[0],
      checkIn: now.toLocaleTimeString(),
      checkOut: null,
      status: isLate ? 'late' : 'present'
    };
    
    const updatedAttendance = [...attendance, newRecord];
    setLocalStorage('attendance', updatedAttendance);
    setAttendance(updatedAttendance);
    setTodayRecord(newRecord);

    // Send notification
    const notificationService = NotificationService.getInstance();
    if (isLate) {
      await notificationService.notifyLateArrival(user);
    } else {
      await notificationService.notifyCheckIn(user);
    }
  };

  const handleCheckOut = async () => {
    if (todayRecord) {
      const updatedRecord = {
        ...todayRecord,
        checkOut: new Date().toLocaleTimeString()
      };
      
      const updatedAttendance = attendance.map(record =>
        record.id === todayRecord.id ? updatedRecord : record
      );
      
      setLocalStorage('attendance', updatedAttendance);
      setAttendance(updatedAttendance);
      setTodayRecord(updatedRecord);

      // Send notification
      await NotificationService.getInstance().notifyCheckOut(user);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Employee Dashboard</span>
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </h2>
              <p className="text-gray-500 mt-1">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={handleCheckIn}
                disabled={!!todayRecord}
                className={`flex items-center px-6 py-3 rounded-lg ${
                  todayRecord
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!todayRecord || !!todayRecord.checkOut}
                className={`flex items-center px-6 py-3 rounded-lg ${
                  !todayRecord || todayRecord.checkOut
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Check Out
              </button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Today's Status</h3>
              {todayRecord ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Check In Time</p>
                    <p className="text-lg font-semibold">{todayRecord.checkIn}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Check Out Time</p>
                    <p className="text-lg font-semibold">
                      {todayRecord.checkOut || 'Not checked out'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No attendance recorded for today</p>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Attendance History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {attendance
                .filter(record => record.userId === user.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => (
                  <div key={record.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.date}</p>
                        <p className="text-sm text-gray-500">
                          {record.checkIn} - {record.checkOut || 'Not checked out'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
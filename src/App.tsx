import React, { useState, useEffect } from 'react';
import { User } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeRegistrationForm from './components/EmployeeRegistrationForm';
import { generateMockData } from './utils/mockData';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    generateMockData();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setShowRegistration(false);
  };

  if (!user) {
    return showRegistration ? (
      <div>
        <button
          onClick={() => setShowRegistration(false)}
          className="fixed top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
        >
          Back to Login
        </button>
        <EmployeeRegistrationForm />
      </div>
    ) : (
      <Auth onLogin={handleLogin} />
    );
  }

  return user.role === 'admin' ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <EmployeeDashboard user={user} onLogout={handleLogout} />
  );
}

export default App;
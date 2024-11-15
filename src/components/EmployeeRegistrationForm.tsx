import React, { useState } from 'react';
import { User } from '../types';
import { getLocalStorage, setLocalStorage } from '../utils/mockData';
import InputField from './forms/InputField';
import { CheckCircle2, UserPlus } from 'lucide-react';
import NotificationService from '../services/notificationService';

interface EmployeeRegistrationFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  startDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  startDate: '',
};

export default function EmployeeRegistrationForm({ onSuccess }: EmployeeRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Please enter a valid email address'
          : '';
      case 'startDate':
        return !value ? 'Please select a start date' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const users = getLocalStorage<User>('users');
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: 'employee',
        joinDate: formData.startDate,
      };

      setLocalStorage('users', [...users, newUser]);
      
      // Send notification
      await NotificationService.getInstance().notifyNewEmployee(formData.name);
      
      setShowSuccess(true);
      setFormData(initialFormData);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error) {
      setErrors({
        submit: 'An error occurred while registering the employee. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Register New Employee
        </h2>
      </div>

      {showSuccess && (
        <div className="mb-4 p-4 rounded-md bg-green-50 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-700">
            Employee registered successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <InputField
          label="Start Date"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />

        {errors.submit && (
          <div className="text-red-600 text-sm mt-2">{errors.submit}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Registering...' : 'Register Employee'}
        </button>
      </form>
    </div>
  );
}
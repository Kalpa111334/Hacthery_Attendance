import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  pattern?: string;
}

export default function InputField({
  label,
  type,
  name,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
  pattern
}: InputFieldProps) {
  const id = `field-${name}`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        <input
          type={type}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          pattern={pattern}
          className={`block w-full rounded-md shadow-sm ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
// Theme Components for Red and White SMS Theme
import React from 'react';

// Primary Button Component
export function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  size = 'md', 
  variant = 'solid',
  className = '',
  type = 'button',
  ...props 
}) {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    solid: 'bg-primary-600 hover:bg-primary-700 text-white shadow-red',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
    ghost: 'text-primary-600 hover:bg-primary-50',
    gradient: 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-red-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-medium rounded-lg transition-all duration-200 
        focus:outline-none focus:ring-4 focus:ring-primary-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Secondary Button Component
export function SecondaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  size = 'md',
  className = '',
  type = 'button',
  ...props 
}) {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        bg-secondary-100 hover:bg-secondary-200 text-secondary-700
        border border-secondary-300 font-medium rounded-lg 
        transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-secondary-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component
export function Card({ 
  children, 
  className = '', 
  hover = false, 
  glow = false,
  padding = 'md',
  ...props 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-secondary-200 
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-red-lg transform hover:scale-[1.02] transition-all duration-300' : 'shadow-sm'}
        ${glow ? 'shadow-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Badge Component
export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
    xl: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    accent: 'bg-accent-100 text-accent-700 border border-accent-200',
    success: 'bg-success-light text-success-dark border border-success',
    warning: 'bg-warning-light text-warning-dark border border-warning',
    error: 'bg-error-light text-error-dark border border-error'
  };

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-medium rounded-full inline-flex items-center
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

// Input Component
export function Input({ 
  label, 
  error, 
  className = '', 
  required = false,
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg text-secondary-900
          ${error 
            ? 'border-error focus:border-error focus:ring-error' 
            : 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:bg-secondary-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

// Select Component
export function Select({ 
  label, 
  error, 
  children, 
  className = '', 
  required = false,
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 border rounded-lg text-secondary-900 bg-white
          ${error 
            ? 'border-error focus:border-error focus:ring-error' 
            : 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:bg-secondary-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

// Textarea Component
export function Textarea({ 
  label, 
  error, 
  className = '', 
  required = false,
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full px-3 py-2 border rounded-lg text-secondary-900 resize-vertical
          ${error 
            ? 'border-error focus:border-error focus:ring-error' 
            : 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:bg-secondary-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

// Alert Component
export function Alert({ 
  children, 
  variant = 'info', 
  title,
  className = '',
  onClose,
  ...props 
}) {
  const variantClasses = {
    success: 'bg-success-light border-success text-success-dark',
    warning: 'bg-warning-light border-warning text-warning-dark',
    error: 'bg-error-light border-error text-error-dark',
    info: 'bg-primary-50 border-primary-200 text-primary-800'
  };

  const iconClasses = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <div
      className={`
        p-4 rounded-lg border-l-4 
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start">
        <span className="text-lg mr-3">{iconClasses[variant]}</span>
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <div>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current hover:opacity-75 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-primary-200 border-t-primary-600 
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}

// Modal Component
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`
          bg-white rounded-xl shadow-red-xl w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-y-auto
          transform transition-all duration-300 scale-100
          ${className}
        `}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Responsive Grid Component
export function ResponsiveGrid({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '',
  ...props 
}) {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridCols = `grid-cols-${cols.xs} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;

  return (
    <div
      className={`
        grid ${gridCols} ${gapClasses[gap]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Responsive Container Component
export function Container({ 
  children, 
  size = 'full',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

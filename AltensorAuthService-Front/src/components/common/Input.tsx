import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  type = 'text',
  id,
  required,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon-left">{icon}</span>}
        <input
          id={inputId}
          type={effectiveType}
          className={`form-control ${icon ? 'has-left-icon' : ''} ${isPassword ? 'has-right-icon' : ''} ${className}`}
          required={required}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-icon-btn-right"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            title={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <small className="form-hint">{hint}</small>}
      {error && <small className="form-error">{error}</small>}
    </div>
  );
};

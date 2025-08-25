import React, { useState, useRef, useEffect } from 'react';
import { useMobile } from '../../hooks/useMobile';

interface MobileFormProps {
  onSubmit: (data: Record<string, any>) => void;
  children: React.ReactNode;
  className?: string;
  autoComplete?: boolean;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  onSubmit,
  children,
  className = '',
  autoComplete = true
}) => {
  const { isMobile, isSmallMobile } = useMobile();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Blur active input to hide mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const formData = new FormData(formRef.current!);
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    onSubmit(data);
  };

  // Auto-scroll form fields into view on focus (mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300); // Delay to account for keyboard animation
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('focusin', handleFocus);
      return () => form.removeEventListener('focusin', handleFocus);
    }
  }, [isMobile]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`mobile-form ${isMobile ? 'mobile-optimized' : ''} ${isSmallMobile ? 'small-mobile' : ''} ${className}`}
      autoComplete={autoComplete ? 'on' : 'off'}
      noValidate
    >
      {children}
    </form>
  );
};

interface MobileInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  autoComplete?: string;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  autoComplete,
  pattern,
  min,
  max,
  step
}) => {
  const { isMobile } = useMobile();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`form-group ${isFocused ? 'focused' : ''} ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required" aria-label="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="form-input"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete={autoComplete}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        // Mobile optimizations
        inputMode={getInputMode(type)}
        style={{
          fontSize: isMobile ? '16px' : undefined, // Prevents zoom on iOS
        }}
      />
    </div>
  );
};

interface MobileTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  value,
  onChange,
  rows = 4,
  maxLength,
  className = ''
}) => {
  const { isMobile } = useMobile();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`form-group ${isFocused ? 'focused' : ''} ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required" aria-label="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        className="form-textarea"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={rows}
        maxLength={maxLength}
        style={{
          fontSize: isMobile ? '16px' : undefined, // Prevents zoom on iOS
        }}
      />
      {maxLength && (
        <div className="form-char-count">
          {value?.length || 0} / {maxLength}
        </div>
      )}
    </div>
  );
};

interface MobileSelectProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const { isMobile } = useMobile();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`form-group ${isFocused ? 'focused' : ''} ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required" aria-label="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        className="form-select"
        required={required}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          fontSize: isMobile ? '16px' : undefined, // Prevents zoom on iOS
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Helper function to determine inputMode for mobile keyboards
function getInputMode(type: string): string | undefined {
  switch (type) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'url':
      return 'url';
    case 'number':
      return 'numeric';
    case 'search':
      return 'search';
    default:
      return undefined;
  }
}

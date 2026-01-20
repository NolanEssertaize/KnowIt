/**
 * @file useAuth.ts
 * @description Authentication Hook - Business logic for auth screens
 * 
 * Pattern: MVVM - This hook serves as the ViewModel for auth views
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store';
import type { UserCreate, UserLogin } from '@/shared/api';

/**
 * Form validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  };
}

/**
 * Auth result type
 */
interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Auth hook return type
 */
interface UseAuthReturn {
  // State
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  validationErrors: ValidationResult['errors'];
  
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setFullName: (name: string) => void;
  handleLogin: () => Promise<AuthResult>;
  handleRegister: () => Promise<AuthResult>;
  handleLogout: () => Promise<void>;
  clearError: () => void;
  resetForm: () => void;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Authentication hook
 */
export function useAuth(): UseAuthReturn {
  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationResult['errors']>({});

  // Global auth state
  const {
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    initialize,
    isInitialized,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  /**
   * Validate login form
   */
  const validateLogin = useCallback((): ValidationResult => {
    const errors: ValidationResult['errors'] = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [email, password]);

  /**
   * Validate registration form
   */
  const validateRegister = useCallback((): ValidationResult => {
    const errors: ValidationResult['errors'] = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [email, password, confirmPassword]);

  /**
   * Handle login action
   * Returns { success: true } or { success: false, error: string }
   */
  const handleLogin = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[useAuth] Attempting login');
    
    const validation = validateLogin();
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, error: 'Please fix validation errors' };
    }

    try {
      const loginData: UserLogin = {
        email: email.trim().toLowerCase(),
        password,
      };

      await login(loginData);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('[useAuth] Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [email, password, login, validateLogin]);

  /**
   * Handle registration action
   * Returns { success: true } or { success: false, error: string }
   */
  const handleRegister = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[useAuth] Attempting registration');
    
    const validation = validateRegister();
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, error: 'Please fix validation errors' };
    }

    try {
      const registerData: UserCreate = {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim() || null,
      };

      await register(registerData);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      console.error('[useAuth] Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [email, password, fullName, register, validateRegister]);

  /**
   * Handle logout action
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    console.log('[useAuth] Logging out');
    await logout();
  }, [logout]);

  /**
   * Reset form fields
   */
  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setValidationErrors({});
    clearError();
  }, [clearError]);

  return {
    // State
    email,
    password,
    confirmPassword,
    fullName,
    isLoading,
    error,
    isAuthenticated,
    validationErrors,

    // Actions
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError,
    resetForm,
  };
}

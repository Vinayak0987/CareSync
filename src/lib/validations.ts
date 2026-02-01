/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validates Indian phone number
 * Accepts 10 digit numbers
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove any non-digit characters
  const cleanedPhone = phone.replace(/\D/g, '');

  if (cleanedPhone.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  // Check if it starts with a valid digit (6-9 for Indian mobile numbers)
  if (!/^[6-9]/.test(cleanedPhone)) {
    return { isValid: false, error: 'Phone number must start with 6, 7, 8, or 9' };
  }

  return { isValid: true };
};

/**
 * Validates full name
 */
export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, error: 'Name should only contain letters and spaces' };
  }

  return { isValid: true };
};

/**
 * Validates date of birth
 * Ensures user is at least 1 year old and not more than 150 years old
 */
export const validateDateOfBirth = (dob: string): ValidationResult => {
  if (!dob) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 1) {
    return { isValid: false, error: 'User must be at least 1 year old' };
  }

  if (age > 150) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }

  return { isValid: true };
};

/**
 * Validates medical license number
 */
export const validateLicenseNumber = (license: string): ValidationResult => {
  if (!license) {
    return { isValid: false, error: 'License number is required' };
  }

  if (license.trim().length < 5) {
    return { isValid: false, error: 'License number must be at least 5 characters long' };
  }

  return { isValid: true };
};

/**
 * Validates specialty field
 */
export const validateSpecialty = (specialty: string): ValidationResult => {
  if (!specialty) {
    return { isValid: false, error: 'Specialty is required' };
  }

  if (specialty.trim().length < 3) {
    return { isValid: false, error: 'Specialty must be at least 3 characters long' };
  }

  return { isValid: true };
};

/**
 * Validates years of experience
 */
export const validateExperience = (experience: string): ValidationResult => {
  if (!experience) {
    return { isValid: false, error: 'Years of experience is required' };
  }

  const exp = parseInt(experience, 10);

  if (isNaN(exp)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (exp < 0) {
    return { isValid: false, error: 'Experience cannot be negative' };
  }

  if (exp > 70) {
    return { isValid: false, error: 'Please enter a valid years of experience' };
  }

  return { isValid: true };
};

/**
 * Validates store/pharmacy name
 */
export const validateStoreName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Store name is required' };
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: 'Store name must be at least 3 characters long' };
  }

  return { isValid: true };
};

/**
 * Validates address
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  if (address.trim().length < 10) {
    return { isValid: false, error: 'Please enter a complete address (at least 10 characters)' };
  }

  return { isValid: true };
};

/**
 * Gets password strength indicator
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  color: string;
} => {
  let score = 0;

  if (!password) {
    return { strength: 'weak', score: 0, color: 'text-gray-400' };
  }

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2) {
    return { strength: 'weak', score, color: 'text-red-500' };
  } else if (score <= 4) {
    return { strength: 'medium', score, color: 'text-orange-500' };
  } else if (score <= 5) {
    return { strength: 'strong', score, color: 'text-yellow-500' };
  } else {
    return { strength: 'very-strong', score, color: 'text-green-500' };
  }
};

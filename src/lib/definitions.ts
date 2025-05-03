import { z } from 'zod';
import { isValidOTPFormat } from './otp-utils';

export const loginSchema = z.object({
  countryCode: z.string().superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Country code is required' });
      return;
    }
    if (!/^\+[1-9]\d{0,10}$/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter a valid country code (e.g. +27)' });
      return;
    }
    if (val.length > 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Country code is too long' });
    }
  }),

  cellPhone: z.string().superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Phone number is required' });
      return;
    }
    if (!/^[0-9]\d{1,45}$/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter a valid phone number' });
      return;
    }
    if (val.length > 45) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Phone number is too long' });
    }
  }),

  // recaptchaToken: z.string().superRefine((val, ctx) => {
  //   if (!val) {
  //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'reCAPTCHA token is required' });
  //   }
  // }),
});


// Define the register credentials schema using Zod
export const registerSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").nonempty("Password is required"),
  confirmPassword: z.string().nonempty("Please confirm your password"),
  firstname: z.string().min(1, "First name is required").nonempty("First name is required"),
  lastname: z.string().min(1, "Last name is required").nonempty("Last name is required"),
  countryCode: z.string()
    .regex(/^\+[1-9]\d{0,2}$/, 'Please enter a valid country code (e.g. +27)')
    .nonempty('Country code is required'),
  phone: z.string()
    .regex(/^[0-9]\d{7,14}$/, 'Please enter a valid phone number')
    .nonempty('Phone number is required'),
  // recaptchaToken: z.string().nonempty("reCAPTCHA token is required"),
  csrfToken: z.string().nonempty("CSRF token is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});


// Admin Profile Schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').nonempty('First name is required'),
  lastName: z.string().min(1, 'Last name is required').nonempty('Last name is required'),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  countryCode: z.string()
    .regex(/^\+[1-9]\d{0,2}$/, 'Please enter a valid country code (e.g. +27)')
    .nonempty('Country code is required'),
  phone: z.string()
    .regex(/^[0-9]\d{7,14}$/, 'Please enter a valid phone number')
    .nonempty('Phone number is required'),
  gender: z.string().min(1, 'Gender is required'),
  idNumber: z.string().regex(/^\d{13}$/, 'ID Number must be exactly 13 digits').nonempty('ID Number is required'),
  address: z.string().min(1, 'Residential address is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  // recaptchaToken: z.string().nonempty("reCAPTCHA token is required"),
  csrfToken: z.string().nonempty("CSRF token is required"),
});

// Input validation schema
export const verifyOtpSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  cellPhone: z.string().min(1, "Phone number is required"),
  otp: z.string().refine(isValidOTPFormat, "OTP must be 6 digits"),
  // recaptchaToken: z.string().min(1, "reCAPTCHA token is required")
});

// Loan application schema
export const loanApplicationSchema = z.object({
  // Personal Information
  email: z.string().email("Invalid email format").nonempty("Email is required").toLowerCase(),
  firstname: z.string().min(1, "First name is required").nonempty("First name is required"),
  lastname: z.string().min(1, "Last name is required").nonempty("Last name is required"),
  countryCode: z.string()
    .regex(/^\+[1-9]\d{0,2}$/, 'Please enter a valid country code (e.g. +27)')
    .nonempty('Country code is required'),
  phone: z.string()
    .regex(/^[0-9]\d{7,14}$/, 'Please enter a valid phone number')
    .nonempty('Phone number is required'),
  idNumber: z.string().regex(/^\d{13}$/, 'ID Number must be exactly 13 digits').nonempty('ID Number is required'),
  
  // Employment Information
  employer: z.string().min(1, "Employer is required").nonempty("Employer is required"),
  workAddress: z.string().min(1, "Work address is required").nonempty("Work address is required"),
  
  // Banking Details
  accountNumber: z.string().regex(/^\d+$/, "Account number must contain only digits").nonempty("Account number is required"),
  accountName: z.string().min(1, "Account holder name is required").nonempty("Account holder name is required"),
  accountType: z.string().min(1, "Account type is required").nonempty("Account type is required"),
  payDate: z.string().nonempty("Pay date is required"),
  
  // Loan Details
  loanAmount: z.number().positive("Loan amount must be positive").default(1000).optional(),
  loanTermMonths: z.number().int().positive("Loan term must be positive").default(12).optional(),
  interestRate: z.number().positive("Interest rate must be positive").default(5.0).optional(),
  purpose: z.string().default("Personal").optional(),
  
  // Security and Verification
  // recaptchaToken: z.string().nonempty("reCAPTCHA token is required"),
  csrfToken: z.string().nonempty("CSRF token is required"),
  
  // Flag for loan application
  isLoanApplication: z.boolean().optional()
});

export const recoverAccountSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  // recaptchaToken: z.string().nonempty("reCAPTCHA token is required"),
  // csrfToken: z.string().nonempty("CSRF token is required"),
});

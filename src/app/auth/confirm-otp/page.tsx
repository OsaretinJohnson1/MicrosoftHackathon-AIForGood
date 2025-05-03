"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Loader2, ArrowLeft } from "lucide-react";

interface FormErrors {
  otp?: string;
  general?: string;
}

interface ValidationState {
  otp: boolean;
}

export default function ConfirmOtpPage() {
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<ValidationState>({
    otp: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validation functions
  const validateOtp = (otp: string): string | undefined => {
    if (!otp) {
      return "OTP is required";
    }
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp)) {
      return "Please enter a valid 6-digit OTP";
    }
  };

  // Handle input changes with validation
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input and limit to 6 digits
    const newOtp = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(newOtp);
    
    if (touched.otp) {
      const otpError = validateOtp(newOtp);
      setErrors(prev => ({ ...prev, otp: otpError, general: undefined }));
    }

    // Auto-submit when 6 digits are entered
    if (newOtp.length === 6 && !errors.otp) {
      // Set a slight timeout to give user visual feedback
      setTimeout(() => {
        const form = e.target.closest('form');
        if (form) form.requestSubmit();
      }, 300);
    }
  };

  // Handle input blur (when field loses focus)
  const handleBlur = () => {
    setTouched(prev => ({ ...prev, otp: true }));
    const otpError = validateOtp(otp);
    setErrors(prev => ({ ...prev, otp: otpError, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const otpError = validateOtp(otp);
    
    // Mark all fields as touched
    setTouched(prev => ({ ...prev, otp: true }));

    // If there are validation errors, show them and prevent submission
    if (otpError) {
      setErrors({
        otp: otpError,
        general: undefined
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Get cellPhone from query params or sessionStorage
      const params = new URLSearchParams(window.location.search);
      const cellPhone = params.get('phone') || sessionStorage.getItem('phoneNumber');
      
      if (!cellPhone) {
        throw new Error("Phone number not found. Please go back and try again.");
      }
      
      // Call the API to verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellPhone, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.general || 'Failed to verify OTP');
      }
      
      // Redirect to dashboard after successful verification
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setErrors({ general: error.message || 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Compute input field classes based on validation state
  const getInputClassName = (fieldName: keyof ValidationState) => {
    const baseClasses = "mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-input text-foreground dark:bg-gray-700 dark:text-white text-center text-xl tracking-widest";
    const errorClasses = touched[fieldName] && errors[fieldName] 
      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
      : "border-gray-300";
    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
      <div className="absolute top-2 left-2">
        <button 
          onClick={() => router.back()} 
          className="group flex items-center text-gray-600 dark:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            px-3 py-1.5 rounded-full 
            transition-all duration-300 
            ease-in-out 
            transform hover:-translate-x-1"
        >
          <ArrowLeft 
            className="mr-2 h-5 w-5 
              text-gray-500 group-hover:text-indigo-600 
              dark:text-gray-400 dark:group-hover:text-indigo-400 
              transition-colors duration-300"
          />
          <span className="text-sm font-medium 
            text-gray-700 group-hover:text-indigo-600 
            dark:text-gray-300 dark:group-hover:text-indigo-400 
            transition-colors duration-300">
            Back
          </span>
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-4 space-x-2">
          <Box className="w-8 h-8 text-indigo-600 dark:text-white" />
          <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Ubuntu Loan</span>
        </div>
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">Verify OTP</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
          Enter the 6-digit code sent to your phone
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              onBlur={handleBlur}
              className={getInputClassName('otp')}
              placeholder="• • • • • •"
            />
            {touched.otp && errors.otp && (
              <p className="text-red-600 text-xs mt-1 animate-pulse text-center">{errors.otp}</p>
            )}
          </div>

          {errors.general && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-xs text-center">{errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            <button 
              onClick={async () => {
                try {
                  // Get cellPhone from query params or sessionStorage
                  const params = new URLSearchParams(window.location.search);
                  const cellPhone = params.get('phone') || sessionStorage.getItem('phoneNumber');
                  
                  if (!cellPhone) {
                    throw new Error("Phone number not found. Please go back and try again.");
                  }
                  
                  // Call the login API to resend OTP
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cellPhone }),
                  });
                  
                  const data = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to resend OTP');
                  }
                  
                  // Show success message
                  alert("OTP resent successfully!");
                } catch (error: any) {
                  console.error('Resend OTP error:', error);
                  alert(error.message || 'Failed to resend OTP. Please try again.');
                }
              }}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400 transition-colors duration-200"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 
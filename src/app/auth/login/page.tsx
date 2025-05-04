"use client"


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Loader2, ArrowLeft, Eye, EyeOff, ChevronDown, CheckCircle } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";


interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoadingState {
  email: boolean;
  google: boolean;
}

interface ValidationState {
  email: boolean;
  password: boolean;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<ValidationState>({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState<LoadingState>({
    email: false,
    google: false,
  });
  const [showAccountCreatedMessage, setShowAccountCreatedMessage] = useState(false);
  const [step, setStep] = useState<'login' | 'success'>('login');
  const router = useRouter();

  // Check for accountCreated parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accountCreated = searchParams.get('accountCreated');
    if (accountCreated === 'true') {
      setShowAccountCreatedMessage(true);
      // Remove the parameter from URL to prevent showing the message on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowAccountCreatedMessage(false);
      }, 5000);
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return undefined;
  };

  // Handle input changes with validation
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    console.log("Form submission started");
    e.preventDefault();
    console.log("Default form behavior prevented");
    
    try {
      // Validate inputs
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      
      console.log("Form validation:", { emailError, passwordError });
          
      // Mark fields as touched
      setTouched({ email: true, password: true });
            
      // Return early if validation fails
      if (emailError || passwordError) {
        console.log("Validation failed");
          setErrors({ 
          email: emailError,
          password: passwordError,
          general: undefined
        });
        return;
      }

      console.log("Starting login process for:", email);

      // Show loading state
      setLoading(prev => ({ ...prev, email: true }));
      setErrors({});

      // Directly call signIn from NextAuth
      console.log("Calling signIn method...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      
      console.log("SignIn result:", result);
      
      // Handle login failure
      if (result?.error) {
        console.log("Login error:", result.error);
        setErrors({
          general: "Login failed. Please check your email and password."
        });
        setLoading(prev => ({ ...prev, email: false }));
        return;
      }

      // Handle successful login
      if (result?.ok) {
        console.log("Login successful!");
        setStep("success");
          
        // Wait briefly before redirect to show success animation
          setTimeout(() => {
          console.log("Redirecting to dashboard");
          router.push("/dashboard");
        }, 1500);
        }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again."
      });
      setLoading(prev => ({ ...prev, email: false }));
      } finally {
      if (!errors.general) {
        setLoading(prev => ({ ...prev, email: false }));
      }
    }
  };

   return (
    <motion.div 
      className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-50 w-full">
        <Header isLoggedIn={false} />
      </div>
      
      {/* Background decorative elements with subtle animation */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-64 bg-[#fccf03]/10 -skew-y-6 transform -translate-y-32 z-0"
        animate={{ 
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      ></motion.div>
      
      <motion.div 
        className="absolute bottom-0 right-0 w-full h-64 bg-[#fccf03]/10 skew-y-6 transform translate-y-32 z-0"
        animate={{ 
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          repeatType: "reverse",
          delay: 2
        }}
      ></motion.div>
      
      {/* Floating decorative circles with animation */}
      <motion.div 
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
        animate={{ 
          x: [0, 15, 0],
          y: [0, 10, 0],
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          repeatType: "mirror" 
        }}
      ></motion.div>
      
      <motion.div 
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-tr from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
        animate={{ 
          x: [0, -20, 0],
          y: [0, -15, 0],
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          repeatType: "mirror" 
        }}
      ></motion.div>
      
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <motion.div 
          className="bg-gradient-to-br from-stone-800 to-stone-900 shadow-xl rounded-lg p-6 max-w-md w-full border border-stone-700 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4 space-x-2">
            <Box className="w-8 h-8 text-[#fccf03]" />
            <span className="text-2xl font-bold text-stone-100 tracking-tight">Ubuntu Loan</span>
          </div>
          
          {showAccountCreatedMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center text-green-500">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>Your account has been created successfully. You can now log in.</p>
            </div>
          )}
          
          {step === 'login' ? (
            <>
                <div>
                <h2 className="text-xl font-bold text-center mb-4 text-stone-100">Login</h2>
                          </div>
              <form 
                onSubmit={(e) => {
                  console.log("Form onSubmit triggered");
                  handleEmailPasswordLogin(e);
                }} 
                className="space-y-4"
                method="post"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const emailError = validateEmail(email);
                      setErrors(prev => ({ ...prev, email: emailError }));
                                }}
                    className="mt-1 block w-full px-4 py-2 border border-stone-700 rounded-lg shadow-sm focus:ring-[#fccf03] focus:border-[#fccf03] bg-stone-800 text-white"
                    placeholder="your.email@example.com"
                    required
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, password: true }));
                        const passwordError = validatePassword(password);
                        setErrors(prev => ({ ...prev, password: passwordError }));
                      }}
                      className="mt-1 block w-full px-4 py-2 border border-stone-700 rounded-lg shadow-sm focus:ring-[#fccf03] focus:border-[#fccf03] bg-stone-800 text-white pr-10"
                      placeholder="********"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-stone-400 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                
                {errors.general && (
                  <div className="p-2 bg-red-900/20 border border-red-800 rounded-md">
                    <p className="text-red-400 text-xs">{errors.general}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs">
                  <Link
                    href="/auth/signup"
                    className="font-medium text-[#fccf03] hover:underline transition-colors duration-200"
                  >
                    Create an account
                  </Link>
                  <Link
                    href="/auth/account-recovery"
                    className="text-stone-400 hover:text-[#fccf03] transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={loading.email}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
                    loading.email
                      ? "bg-stone-600 text-stone-400 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md"
                  }`}
                >
                  {loading.email ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging In
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>

                {/* Alternative login method */}
                <div className="mt-4 pt-4 border-t border-stone-700">
                  <p className="text-xs text-stone-400 mb-2 text-center">
                    If the form submission doesn't work, try this alternative:
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email || !password) {
                        setErrors({
                          general: "Please enter email and password"
                        });
                        return;
                      }
                      
                      setLoading(prev => ({ ...prev, email: true }));
                      try {
                        console.log("Using alternative login method");
                        const result = await signIn("credentials", {
                          redirect: false,
                          email,
                          password,
                        });
                        
                        console.log("Alternative login result:", result);
                        
                        if (result?.error) {
                          setErrors({
                            general: "Login failed: " + result.error
                          });
                        } else if (result?.ok) {
                          setStep("success");
                          setTimeout(() => {
                            router.push("/dashboard");
                          }, 1500);
                        }
                      } catch (error) {
                        console.error("Alternative login error:", error);
                        setErrors({
                          general: "Login error: " + (error instanceof Error ? error.message : String(error))
                        });
                      } finally {
                        setLoading(prev => ({ ...prev, email: false }));
                      }
                    }}
                    className="w-full py-2 px-4 mt-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                    Alternative Login Method
                    </button>
                </div>
              </form>
            </>
          ) : (
            // Success animation
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-bounce mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-stone-100">Login Successful!</h2>
              <p className="text-sm text-center text-stone-300">
                Redirecting to your dashboard...
              </p>
              <div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
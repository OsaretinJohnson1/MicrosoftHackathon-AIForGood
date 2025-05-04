"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv, fadeIn, staggerContainer } from "@/components/motion/motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { AnimatedButton } from "@/components/animated-button"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({})
  
  // Track which fields have been touched/focused
  const [touchedFields, setTouchedFields] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  })
  
  // Add a common style for field error messages
  const fieldErrorStyle = "text-red-500 text-xs mt-1 font-medium";

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case 'email':
        if (value === '') {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      
      case 'password':
        if (value === '') {
          errors.password = 'Password is required';
        }
        break;
      
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError(null)
    
    // Clear field errors when user types - completely remove the field from errors
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors[name as keyof typeof fieldErrors];
      setFieldErrors(updatedErrors);
    }
  }

  // Handle blur event (when field loses focus)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const fieldValue = formData[name as keyof typeof formData];
    if (typeof fieldValue === 'string') {
      const errors = validateField(name, fieldValue);
      
      setFieldErrors(prev => ({
        ...prev,
        ...errors
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submission started")
    setIsLoading(true)
    setFormError(null)
    
    // Mark all fields as touched
    setTouchedFields({
      email: true,
      password: true
    });
    
    // Validate all fields
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    
    const allErrors = { ...emailErrors, ...passwordErrors };
    
    // Update field errors state
    setFieldErrors(allErrors);
    
    // If there are any field errors, don't submit
    if (Object.keys(allErrors).length > 0) {
      setFormError("Please fix the errors in the form");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to log in with email:", formData.email)

      // Use NextAuth's signIn method for actual authentication
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password
      })

      console.log("SignIn result:", result)

      // Handle authentication errors
      if (result?.error) {
        console.error("Login failed:", result.error)
        throw new Error("Invalid email or password. Please try again.")
      }
      // Handle successful login
      if (result?.ok) {
        console.log("Login successful, redirecting...")
        router.push("/dashboard") // Redirect to dashboard or another appropriate page
      } else {
        throw new Error("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setFormError(error.message)
      } else {
        setFormError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative">
      <motion.div 
        className="absolute top-6 left-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-purple-700 bg-gray-300 hover:text-purple-900 hover:bg-gray-200"
          onClick={() => router.push('/')}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </motion.div>
      
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer(0.1, 0.2)} className="w-full max-w-md">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <MotionDiv variants={fadeIn(0.1, 0.5)}>
                <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              </MotionDiv>
              <MotionDiv variants={fadeIn(0.2, 0.5)}>
                <CardDescription className="text-center">
                  Log in to your account to continue your cultural journey
                </CardDescription>
              </MotionDiv>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 bg-red-50 p-2 rounded-md"
                    >
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <MotionDiv variants={fadeIn(0.3, 0.5)}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`pl-10 ${(touchedFields.email && fieldErrors.email) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        required
                      />
                    </div>
                    {touchedFields.email && fieldErrors.email && (
                      <p className={fieldErrorStyle}>{fieldErrors.email}</p>
                    )}
                  </div>
                </MotionDiv>
                <MotionDiv variants={fadeIn(0.4, 0.5)}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password<span className="text-red-500">*</span></Label>
                      <Link href="/forgot-password" className="text-sm text-purple-700 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`pl-10 ${(touchedFields.password && fieldErrors.password) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        required
                      />
                    </div>
                    {touchedFields.password && fieldErrors.password && (
                      <p className={fieldErrorStyle}>{fieldErrors.password}</p>
                    )}
                  </div>
                </MotionDiv>
                <MotionDiv variants={fadeIn(0.5, 0.5)}>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </Label>
                  </div>
                </MotionDiv>

                <MotionDiv variants={fadeIn(0.6, 0.5)}>
                  <motion.div whileHover={{ scale: formData.email && formData.password && Object.keys(fieldErrors).length === 0 ? 1.03 : 1 }} 
                    whileTap={{ scale: formData.email && formData.password && Object.keys(fieldErrors).length === 0 ? 0.97 : 1 }}>
                    <Button
                      type="submit"
                      className={`w-full ${Object.values(fieldErrors).some(error => !!error) ? 'bg-purple-400' : 'bg-purple-700 hover:bg-purple-800'}`}
                      disabled={isLoading || Object.values(fieldErrors).some(error => !!error) || !formData.email || !formData.password}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </motion.div>
                </MotionDiv>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <MotionDiv variants={fadeIn(0.7, 0.5)}>
                <div className="grid grid-cols-3 gap-3">
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setIsLoading(true);
                        signIn('google', { 
                          callbackUrl: '/dashboard',
                          state: 'login=true' 
                        });
                      }}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setIsLoading(true);
                        signIn('github', { callbackUrl: '/dashboard' });
                      }}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setIsLoading(true);
                        // Using Facebook instead of Apple since Facebook is configured in auth.ts
                        signIn('facebook', { callbackUrl: '/dashboard' });
                      }}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path fill="#1877F2" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                      </svg>
                    </Button>
                  </motion.div>
                </div>
              </MotionDiv>

              {/* Alternative login method */}
              <MotionDiv variants={fadeIn(0.8, 0.5)} className="mt-4">
                <div className="text-sm text-center text-muted-foreground mb-2">
                  Alternative login method (if form doesn't work)
                </div>
                <Button 
                  variant="secondary"
                  className="w-full"
                  disabled={isLoading || !formData.email || !formData.password}
                  onClick={async () => {
                    console.log("Using alternative login method")
                    setIsLoading(true)
                    setFormError(null)

                    try {
                      const result = await signIn("credentials", {
                        redirect: false,
                        email: formData.email,
                        password: formData.password
                      })

                      console.log("Alternative login result:", result)

                      if (result?.error) {
                        setFormError("Login failed: " + result.error)
                        return
                      }

                      if (result?.ok) {
                        console.log("Alternative login successful")
                        router.push("/dashboard")
                      }
                    } catch (error) {
                      console.error("Alternative login error:", error)
                      setFormError(error instanceof Error ? error.message : "An unexpected error occurred")
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  {isLoading ? <LoadingAnimation /> : "Alternative Login"}
                </Button>
              </MotionDiv>
            </CardContent>
            <CardFooter className="flex justify-center">
              <MotionDiv variants={fadeIn(0.8, 0.5)}>
                <div className="text-sm text-center">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-purple-700 hover:underline">
                    Sign up
                  </Link>
                </div>
              </MotionDiv>
            </CardFooter>
          </Card>
        </motion.div>
      </MotionDiv>
    </div>
  )
}

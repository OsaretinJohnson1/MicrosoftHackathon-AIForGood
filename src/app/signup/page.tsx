"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Github, User, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv, fadeIn, staggerContainer } from "@/components/motion/motion"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({})
  
  // Track which fields have been touched/focused
  const [touchedFields, setTouchedFields] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Add a common style for field error messages
  const fieldErrorStyle = "text-red-500 text-xs mt-1 font-medium";

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case 'name':
        if (value.trim() === '') {
          errors.name = 'Full name is required';
        }
        break;
      
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
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      
      case 'confirmPassword':
        if (value === '') {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      
      default:
        break;
    }
    
    return errors;
  };

  // Validate all fields
  const validateAllFields = () => {
    const nameErrors = validateField('name', formData.name);
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const confirmPasswordErrors = validateField('confirmPassword', formData.confirmPassword);
    
    return { ...nameErrors, ...emailErrors, ...passwordErrors, ...confirmPasswordErrors };
  };

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear general form error when user types
    setFormError(null)
    
    // Clear field-specific error when field changes
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
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
    const errors = validateField(name, fieldValue);
    
    setFieldErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  // Validate form before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.name || !formData.confirmPassword) {
      setFormError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Extract first and last name
      const nameParts = formData.name.trim().split(" ")
      const firstname = nameParts[0]
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

      console.log("Registering with data:", { email: formData.email, firstname, lastname })

      // Submit to registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstname,
          lastname: lastname || firstname, // Use firstname as lastname if not provided
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific API errors
        if (response.status === 409) {
          throw new Error("This email is already registered. Please use a different email or try logging in.")
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error("Registration failed. Please try again.")
        }
      }

      console.log("Registration successful:", data)

      // Sign in the user with NextAuth
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      console.log("SignIn result:", signInResult)

      if (signInResult?.error) {
        throw new Error("Account created but couldn't sign in automatically. Please go to login page.")
      }

      if (signInResult?.ok) {
        router.push("/dashboard") // Redirect to dashboard
      }
    } catch (error) {
      console.error("Signup error:", error)
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
        className="absolute top-4 left-4 sm:top-8 sm:left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="rounded-full bg-gray-300 shadow-md hover:bg-purple-100 hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-purple-800 px-6 py-2 text-base"
          size="default"
        >
          Back
        </Button>
      </motion.div>

      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer(0.1, 0.2)} className="w-full max-w-md">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <MotionDiv variants={fadeIn(0.1, 0.5)}>
                <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              </MotionDiv>
              <MotionDiv variants={fadeIn(0.2, 0.5)}>
                <CardDescription className="text-center">
                  Sign up to start creating and sharing your cultural comics
                </CardDescription>
              </MotionDiv>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
                <MotionDiv variants={fadeIn(0.3, 0.5)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                  </TabsList>
                </MotionDiv>
                <AnimatePresence mode="wait">
                  {activeTab === "email" ? (
                    <TabsContent value="email" key="email-tab">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
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
                          <MotionDiv variants={fadeIn(0.4, 0.5)}>
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name<span className="text-red-500">*</span></Label>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="name"
                                  name="name"
                                  placeholder="Enter your full name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={`pl-10 ${(touchedFields.name && fieldErrors.name) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  required
                                />
                              </div>
                              {touchedFields.name && fieldErrors.name && (
                                <p className={fieldErrorStyle}>{fieldErrors.name}</p>
                              )}
                            </div>
                          </MotionDiv>
                          <MotionDiv variants={fadeIn(0.5, 0.5)}>
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
                          <MotionDiv variants={fadeIn(0.6, 0.5)}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password<span className="text-red-500">*</span></Label>
                              </div>
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={(touchedFields.password && fieldErrors.password) ? "border-red-500 focus-visible:ring-red-500" : ""}
                                required
                              />
                              {touchedFields.password && fieldErrors.password && (
                                <p className={fieldErrorStyle}>{fieldErrors.password}</p>
                              )}
                            </div>
                          </MotionDiv>
                          <MotionDiv variants={fadeIn(0.7, 0.5)}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="confirmPassword">Confirm Password<span className="text-red-500">*</span></Label>
                              </div>
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={(touchedFields.confirmPassword && fieldErrors.confirmPassword) ? "border-red-500 focus-visible:ring-red-500" : ""}
                                required
                              />
                              {touchedFields.confirmPassword && fieldErrors.confirmPassword && (
                                <p className={fieldErrorStyle}>{fieldErrors.confirmPassword}</p>
                              )}
                            </div>
                          </MotionDiv>
                          <MotionDiv variants={fadeIn(0.8, 0.5)}>
                            <Button
                              type="submit"
                              className="w-full bg-purple-700 hover:bg-purple-800"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating account...
                                </>
                              ) : (
                                "Sign Up"
                              )}
                            </Button>
                          </MotionDiv>
                        </form>
                      </motion.div>
                    </TabsContent>
                  ) : (
                    <TabsContent value="social" key="social-tab">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                              setIsLoading(true)
                              signIn('github', { callbackUrl: '/dashboard' })
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Github className="mr-2 h-4 w-4" />
                            )}
                            Continue with GitHub
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                              setIsLoading(true)
                              // Use standard Google provider with registration marker in state
                              signIn('google', { 
                                callbackUrl: '/dashboard',
                                state: 'registration=true'
                              })
                            }}
                            disabled={isLoading}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                              setIsLoading(true)
                              signIn('apple', { callbackUrl: '/dashboard' })
                            }}
                            disabled={isLoading}
                          >
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path
                                d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"
                                fill="#000"
                              />
                            </svg>
                            {isLoading ? 'Connecting...' : 'Continue with Apple'}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <MotionDiv variants={fadeIn(0.8, 0.5)}>
                <div className="text-sm text-center text-muted-foreground">
                  By clicking continue, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </MotionDiv>
              <MotionDiv variants={fadeIn(0.9, 0.5)}>
                <div className="text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-700 hover:underline">
                    Log in
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

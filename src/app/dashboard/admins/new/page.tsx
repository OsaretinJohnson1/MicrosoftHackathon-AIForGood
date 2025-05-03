"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, X, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"

export default function AddAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
    roleId: "1" // Default to admin role
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleId: value }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.firstname) newErrors.firstname = "First name is required"
    if (!formData.lastname) newErrors.lastname = "Last name is required"
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    }
    
    // ID Number validation
    if (!formData.idNumber) {
      newErrors.idNumber = "ID number is required"
    } else if (formData.idNumber.length !== 13) {
      newErrors.idNumber = "ID number must be 13 digits"
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Create admin user with isAdmin value matching roleId selection
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isAdmin: parseInt(formData.roleId) // Set isAdmin based on roleId selection
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create admin user')
      }
      
      toast.success("Admin user created successfully")
      
      // After saving, redirect back to admins list
      router.push("/dashboard/admins")
    } catch (error) {
      console.error("Error creating admin:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create admin user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Add New Admin</h2>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Admin Account Information</CardTitle>
                <CardDescription>Create a new administrator account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input 
                    id="firstname" 
                    name="firstname" 
                    placeholder="John" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.firstname ? 'border-red-500' : ''}`}
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                  {errors.firstname && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input 
                    id="lastname" 
                    name="lastname" 
                    placeholder="Smith" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.lastname ? 'border-red-500' : ''}`}
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                  {errors.lastname && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="john.smith@example.com" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="+27 123 456 7890" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.phone ? 'border-red-500' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input 
                    id="idNumber" 
                    name="idNumber" 
                    placeholder="1234567890123" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.idNumber ? 'border-red-500' : ''}`}
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                  {errors.idNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleId">Admin Role</Label>
                  <Select 
                    defaultValue={formData.roleId}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger id="roleId">
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Admin</SelectItem>
                      <SelectItem value="2">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.password ? 'border-red-500' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    className={`border-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-2 hover:bg-gray-100 transition-colors"
                  onClick={() => router.back()}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="shadow-md hover:shadow-lg transition-shadow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
} 
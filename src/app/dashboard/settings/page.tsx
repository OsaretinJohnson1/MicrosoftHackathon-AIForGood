"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useEffect, useState, ChangeEvent } from "react"
import { useSession } from "next-auth/react"
import { Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// User data interface
interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  idNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  isAdmin?: number;
  roleId?: number;
  userStatus?: number;
  // Add demographic data fields from updated schema
  ageGroup?: string;
  gender?: string;
  occupation?: string;
  incomeLevel?: string;
  // Add bank details field
  bankDetails?: string;
  // Add credit score
  creditScore?: number;
}

// Company data interface (for admin settings)
interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

// Form data interface
interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  // Add demographic data fields
  ageGroup: string;
  gender: string;
  occupation: string;
  incomeLevel: string;
  // Add bank details
  accountNumber: string;
  accountName: string;
  accountType: string;
  bankName: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Company data for admin settings
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  })
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Initialize new demographic fields
    ageGroup: "",
    gender: "",
    occupation: "",
    incomeLevel: "",
    // Initialize bank details
    accountNumber: "",
    accountName: "",
    accountType: "",
    bankName: ""
  })
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData(String(session.user.id))
      // Debug log for session
      console.log("Session user data:", {
        id: session.user.id,
        userStatus: session.user.userStatus,
        isAdmin: session.user.isAdmin,
        email: session.user.email
      })
    } else if (status !== "loading") {
      setLoading(false)
    }
  }, [session, status])
  
  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/crud-users/user?id=${userId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setUserData(data.data)
        // Debug log for user data from API
        console.log("User data from API:", {
          id: data.data.id,
          userStatus: data.data.userStatus,
          isAdmin: data.data.isAdmin,
          roleId: data.data.roleId
        })
        
        // Populate form with user data
        const user = Array.isArray(data.data) ? data.data[0] : data.data
        
        // Parse bankDetails if it exists
        let bankDetails = { accountNumber: "", accountName: "", accountType: "", bankName: "" };
        if (user.bankDetails) {
          try {
            bankDetails = JSON.parse(user.bankDetails);
          } catch (e) {
            console.error("Error parsing bank details:", e);
          }
        }

        setFormData({
          ...formData,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          postalCode: user.postalCode || "",
          // Add demographic data
          ageGroup: user.ageGroup || "",
          gender: user.gender || "",
          occupation: user.occupation || "",
          incomeLevel: user.incomeLevel || "",
          // Add bank details
          accountNumber: bankDetails.accountNumber || "",
          accountName: bankDetails.accountName || "",
          accountType: bankDetails.accountType || "",
          bankName: bankDetails.bankName || ""
        })
        
        // If admin, fetch company settings
        if (user.userStatus === 1 || user.isAdmin === 1 || user.roleId === 1) {
          fetchCompanySettings();
        }
      } else {
        toast.error("Failed to load user data")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }
  
  // Function to fetch company settings
  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/company/settings')
      const data = await response.json()
      
      if (data.success && data.data) {
        // Update company data from API response
        setCompanyData({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          website: data.data.website || "",
          address: data.data.address || "",
          city: data.data.city || "",
          province: data.data.province || "",
          postalCode: data.data.postalCode || ""
        })
      } else {
        console.log("No company data found or request failed")
      }
    } catch (error) {
      console.error("Error fetching company settings:", error)
    }
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }
  
  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    // Extract the company field name from the input id (e.g., company-name -> name)
    const field = id.replace('company-', '')
    
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSaveProfile = async () => {
    setUpdating(true)
    try {
      // Create bank details object
      const bankDetails = JSON.stringify({
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        accountType: formData.accountType,
        bankName: formData.bankName
      });

      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        // Add demographic data to update request
        ageGroup: formData.ageGroup,
        gender: formData.gender,
        occupation: formData.occupation,
        incomeLevel: formData.incomeLevel,
        // Add bank details
        bankDetails: bankDetails
      }
      
      const response = await fetch('/api/crud-users/update-user-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }
  
  const handleSaveCompanySettings = async () => {
    setUpdating(true)
    try {
      // Send company settings to the API
      const response = await fetch('/api/company/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Company settings updated successfully");
      } else {
        toast.error(result.message || "Failed to update company settings");
      }
    } catch (error) {
      console.error("Error updating company settings:", error)
      toast.error("Failed to update company settings")
    } finally {
      setUpdating(false)
    }
  }
  
  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    
    setUpdating(true)
    try {
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }
      
      const response = await fetch('/api/crud-users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Password changed successfully")
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      } else {
        toast.error(result.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Failed to change password")
    } finally {
      setUpdating(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading settings...</p>
        </div>
      </div>
    )
  }
  
  // Check if user is admin - check session first, then fallback to userData
  const isAdmin = 
    // Check from session (new userStatus field)
    (session?.user?.userStatus === 1) || 
    // Check from session (legacy isAdmin field)
    (session?.user?.isAdmin === 1) || 
    // Fallback to userData (if session doesn't have the fields)
    (userData ? (userData.userStatus === 1 || userData.isAdmin === 1 || userData.roleId === 1) : false);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 pt-8 md:p-8 bg-gray-50"
    >
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-yellow-400 hover:bg-yellow-100 dark:hover:bg-gray-800"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Account Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences and profile</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-yellow-400 mb-4" />
            <p className="text-lg text-muted-foreground">Loading your settings...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full max-w-md mb-8 rounded-full bg-gray-100 p-1">
            <TabsTrigger 
              value="profile" 
              className="rounded-full data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="border-2 border-black dark:border-white shadow-md">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input 
                      id="firstname" 
                      value={formData.firstname} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input 
                      id="lastname" 
                      value={formData.lastname} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      disabled={true}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-sm font-medium mb-3">Address Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      value={formData.address} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={formData.city} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode" 
                      value={formData.postalCode} 
                      onChange={handleChange}
                      className="border-2 border-yellow-400 focus-visible:ring-yellow-400"
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={updating}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md hover:shadow-lg transition-all"
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              {/* <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader> */}
              {/* <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch id="two-factor" defaultChecked />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Change Password</Label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        placeholder="Current password" 
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="New password" 
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <Button 
                      className="mt-2" 
                      onClick={handleChangePassword}
                      disabled={updating || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent> */}
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-application">New Loan Applications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when new loan applications are submitted
                      </p>
                    </div>
                    <Switch id="new-application" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="payment-received">Payment Received</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when payments are received</p>
                    </div>
                    <Switch id="payment-received" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="payment-due">Payment Due Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when payments are due</p>
                    </div>
                    <Switch id="payment-due" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  )
}

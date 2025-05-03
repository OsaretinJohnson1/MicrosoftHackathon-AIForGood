"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { 
  UserIcon, 
  Building2, 
  BriefcaseIcon, 
  ClipboardIcon, 
  DownloadIcon, 
  AlertCircleIcon,
  Upload,
  CheckCircle,
  Info 
} from 'lucide-react'
import { Separator } from "@/components/ui/separator"

interface Document {
  id: string
  name: string
  type: string
  status: "pending" | "verified" | "rejected"
  url?: string
  date: string
}

interface UserData {
  id: string
  email: string
  firstname: string
  lastname: string
  phone: string
  idNumber?: string
  verified: boolean
  createdAt: string
  profileComplete: boolean
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  documents?: Document[]
  avatarUrl?: string
  employer?: string
  occupation?: string
  monthlyIncome?: number
  bankName?: string
  accountType?: string
  updatedAt?: string
  accountNumber?: string
  accountName?: string
}

interface ApiUserData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  city: string;
  postalCode: string;
  verified: number;
  signupDate: string;
  profilePic: string | null;
  occupation: string;
  incomeLevel: string;
  bankDetails: string;
  [key: string]: any; // For other fields we might not explicitly need
}

// Add a simple loader component here
const LoaderComponent = () => (
  <div className="flex flex-col items-center justify-center w-full py-8">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="mt-4 text-muted-foreground">Loading profile data...</div>
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [accountNumber, setAccountNumber] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfilePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.id) {
      fetchUserData()
    }
  }, [status, router, session])

  // Ensure account number is properly handled even if id is missing
  const createAccountNumber = (id: number | string | undefined) => {
    if (id === undefined) return "LOAN-00000";
    const idStr = id.toString();
    return `LOAN-${idStr.padStart(5, '0')}`;
  };

  const fetchUserData = async () => {
    try {
      // Check if session is available and has user id
      if (!session?.user?.id) {
        setError("No authenticated user found")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      
      // Use the user endpoint which automatically uses the session ID
      const response = await fetch(`/api/crud-users/user`)
      const data = await response.json()
      
      // Log the full response for debugging
      console.log("API response data:", data);
      
      if (data.success && data.data) {
        const userData = data.data;
        
        // Log key fields we're having trouble with
        console.log("🔍 DEBUG - Fields retrieved from API:");
        console.log("- State from API:", userData.state);
        console.log("- Country from API:", userData.country);
        console.log("- Employer from API:", userData.employer);
        
        setUserData({
          id: userData.id?.toString() || "0",
          email: userData.email || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          phone: userData.phone || "",
          idNumber: userData.idNumber || "",
          verified: Boolean(userData.verified),
          createdAt: userData.signupDate || "",
          profileComplete: true,
          address: {
            street: userData.address || "",
            city: userData.city || "",
            state: userData.state || '',
            zip: userData.postalCode || "",
            country: userData.country || ''
          },
          avatarUrl: userData.profilePic || null,
          employer: userData.employer || '',
          occupation: userData.occupation || "",
          monthlyIncome: parseIncomeLevel(userData.incomeLevel),
          bankName: getBankDetailsValue(userData.bankDetails, 'bankName'),
          accountType: getBankDetailsValue(userData.bankDetails, 'accountType'),
          accountNumber: createAccountNumber(userData.id),
          accountName: getBankDetailsValue(userData.bankDetails, 'accountName')
        });
        
        console.log("🔍 UserData after setState:", {
          state: userData.state,
          country: userData.country,
          employer: userData.employer
        });
        
        // Generate account number based on user ID
        setAccountNumber(createAccountNumber(userData.id))
      } else {
        setError(data.message || "Failed to fetch user data")
      }
    } catch (err) {
      setError("Error connecting to the server")
      console.error("Error fetching user data:", err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to parse income level strings
  const parseIncomeLevel = (incomeLevel: string) => {
    if (!incomeLevel) return undefined;
    
    // Extract numbers from strings like "R10,001 - R20,000"
    const matches = incomeLevel.match(/R([\d,]+)/g);
    if (matches && matches.length > 0) {
      // Take the average of the range if there are two values
      if (matches.length >= 2) {
        const min = Number(matches[0].replace(/[R,]/g, ''));
        const max = Number(matches[1].replace(/[R,]/g, ''));
        return Math.round((min + max) / 2);
      } else {
        // Just parse the single value
        return Number(matches[0].replace(/[R,]/g, ''));
      }
    }
    
    return undefined;
  }
  
  // Helper function to parse bank details JSON
  const getBankDetailsValue = (bankDetailsJson: string, key: string) => {
    try {
      if (!bankDetailsJson) return '';
      const bankDetails = JSON.parse(bankDetailsJson);
      return bankDetails[key] || '';
    } catch (error) {
      console.error("Error parsing bank details:", error);
      return '';
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSaveChanges = async () => {
    if (!userData) return;
    
    try {
      // Format address data as single string for the database
      const addressStr = (document.getElementById('street') as HTMLInputElement).value;
      const stateValue = (document.getElementById('state') as HTMLInputElement)?.value || '';
      const countryValue = (document.getElementById('country') as HTMLInputElement)?.value || '';
      const employerValue = (document.getElementById('employer') as HTMLInputElement)?.value || '';
      
      // Log direct values from the form fields for debugging
      console.log("🔍 Form field values before sending:");
      console.log("- State:", stateValue);
      console.log("- Country:", countryValue);
      console.log("- Employer:", employerValue);
      
      // Create formData object from the input fields - directly use field names matching the database schema
      const formData = {
        firstname: (document.getElementById('firstname') as HTMLInputElement).value,
        lastname: (document.getElementById('lastname') as HTMLInputElement).value,
        email: (document.getElementById('email') as HTMLInputElement).value,
        phone: (document.getElementById('phone') as HTMLInputElement).value,
        idNumber: (document.getElementById('idNumber') as HTMLInputElement).value,
        address: addressStr,
        city: (document.getElementById('city') as HTMLInputElement).value,
        postalCode: (document.getElementById('zip') as HTMLInputElement).value,
        // Use direct field names matching the database schema
        state: stateValue,
        country: countryValue,
        employer: employerValue,
        occupation: (document.getElementById('occupation') as HTMLInputElement)?.value || '',
        // Monthly income
        monthlyIncome: (document.getElementById('monthlyIncome') as HTMLInputElement)?.value || '',
        incomeLevel: convertMonthlyIncomeToIncomeLevel((document.getElementById('monthlyIncome') as HTMLInputElement)?.value || ''),
        // Bank details as JSON string
        bankDetails: JSON.stringify({
          bankName: (document.getElementById('bankName') as HTMLInputElement)?.value || '',
          accountType: (document.getElementById('accountType') as HTMLInputElement)?.value || '',
          accountNumber: (document.getElementById('accountNumber') as HTMLInputElement)?.value || '',
          accountName: (document.getElementById('accountName') as HTMLInputElement)?.value || ''
        })
      };

      // Log the entire formData for debugging
      console.log('Sending form data:', formData);

      // Send the updated data to the API
      const response = await fetch('/api/crud-users/update-user-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("🔍 API update success response:", result);
        toast.success("Profile updated successfully", {
          description: "Your profile information has been updated."
        });
        setIsEditing(false);
        // Refresh user data to show updated information
        fetchUserData();
      } else {
        console.error("Update failed with response:", result);
        toast.error("Failed to save profile", {
          description: `Error: ${result.message || "Failed to save profile information"}. More details in console.`
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile", {
        description: "An unexpected error occurred. Check console for details."
      });
    }
  }

  // Helper function to convert monthly income to income level ranges
  const convertMonthlyIncomeToIncomeLevel = (monthlyIncome: string): string => {
    const income = Number(monthlyIncome);
    if (isNaN(income)) return '';
    
    if (income < 5000) return 'Under R5,000';
    if (income < 10000) return 'R5,000 - R10,000';
    if (income < 20000) return 'R10,001 - R20,000';
    if (income < 30000) return 'R20,001 - R30,000';
    if (income < 50000) return 'R30,001 - R50,000';
    return 'Above R50,000';
  }

  const getVerificationStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
        <AlertCircleIcon className="w-3 h-3" />
        Unverified
      </Badge>
    );
  }

  // Add a helper function to check if required fields are complete
  const hasMissingRequiredFields = (): string[] => {
    if (!userData) return [];
    
    // Check for the missing fields that would prevent loan applications
    const missingFields: string[] = [];
    
    if (!userData.phone || userData.phone === 'NEEDS_UPDATE') {
      missingFields.push('Phone Number');
    }
    
    if (!userData.idNumber) {
      missingFields.push('ID Number');
    }
    
    if (!userData.accountNumber) {
      missingFields.push('Account Number');
    }
    
    if (!userData.accountName) {
      missingFields.push('Account Holder Name');
    }
    
    if (!userData.employer) {
      missingFields.push('Employer');
    }
    
    if (!userData.occupation) {
      missingFields.push('Occupation');
    }
    
    if (!userData.monthlyIncome) {
      missingFields.push('Monthly Income');
    }
    
    if (!userData.bankName) {
      missingFields.push('Bank Name');
    }
    
    if (!userData.accountType) {
      missingFields.push('Account Type');
    }
    
    if (!userData.address?.state) {
      missingFields.push('State/Province');
    }
    
    if (!userData.address?.country) {
      missingFields.push('Country');
    }
    
    return missingFields;
  };

  // Function to check if there are any missing fields
  const hasIncompleteProfile = (): boolean => {
    return hasMissingRequiredFields().length > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Button onClick={fetchUserData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Add warning if user is missing required fields */}
      {userData && hasIncompleteProfile() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-3 rounded-md flex items-start">
          <AlertCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Update Required</div>
            <p className="text-sm">
              Please complete your profile information to be eligible for loans. 
              Missing: {hasMissingRequiredFields().join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
        <Card className="card-hover relative">
          <CardHeader className="pb-3">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details and preferences</CardDescription>
            <div className="absolute top-3 right-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 pb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      toast.info(`File "${e.target.files[0].name}" selected for upload`)
                    }
                  }}
                />
                
                <div onClick={handleProfilePhotoClick} className={isEditing ? "cursor-pointer" : ""}>
                  <Avatar className="h-28 w-28">
                    <AvatarImage 
                      src={userData?.avatarUrl || "/placeholder-avatar.png"} 
                      alt={userData?.firstname && userData?.lastname 
                        ? `${userData.firstname} ${userData.lastname}` 
                        : 'User Avatar'} 
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-avatar.png';
                      }}
                    />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {userData?.firstname?.charAt(0) || ''}{userData?.lastname?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={handleProfilePhotoClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                )}
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    defaultValue={userData?.firstname || ''}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    defaultValue={userData?.lastname || ''}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userData?.email || ''}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    defaultValue={userData?.phone || ''}
                    readOnly={!isEditing}
                    className={!userData?.phone || userData?.phone === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                  />
                  {userData?.phone === 'NEEDS_UPDATE' && (
                    <p className="text-yellow-600 text-xs mt-1">Please update your phone number</p>
                  )}
                  {!userData?.phone && (
                    <p className="text-yellow-600 text-xs mt-1">Phone number is required for loan applications</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    defaultValue={userData?.idNumber || ''}
                    readOnly={!isEditing}
                    className={!userData?.idNumber || userData?.idNumber === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                  />
                  {userData?.idNumber === 'NEEDS_UPDATE' && (
                    <p className="text-yellow-600 text-xs mt-1">Please update your ID number</p>
                  )}
                  {!userData?.idNumber && (
                    <p className="text-yellow-600 text-xs mt-1">ID number is required for loan applications</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input id="account" value={accountNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <div className="pt-2">
                    {userData && getVerificationStatusBadge(userData.verified)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Address Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input 
                      id="street" 
                      defaultValue={userData?.address?.street || ''} 
                      readOnly={!isEditing} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        defaultValue={userData?.address?.city || ''} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        defaultValue={userData?.address?.state || ''} 
                        readOnly={!isEditing}
                        className={!userData?.address?.state ? 'border-yellow-500 bg-yellow-50' : ''}
                      />
                      {!userData?.address?.state && (
                        <p className="text-yellow-600 text-xs mt-1">State/Province is required for loan applications</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">Postal Code</Label>
                      <Input 
                        id="zip" 
                        defaultValue={userData?.address?.zip || ''} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        defaultValue={userData?.address?.country || ''} 
                        readOnly={!isEditing}
                        className={!userData?.address?.country ? 'border-yellow-500 bg-yellow-50' : ''}
                      />
                      {!userData?.address?.country && (
                        <p className="text-yellow-600 text-xs mt-1">Country is required for loan applications</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4" />
                  Employment Information
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        defaultValue={userData?.employer || ''}
                        readOnly={!isEditing}
                        className={!userData?.employer || userData?.employer === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                      />
                      {userData?.employer === 'NEEDS_UPDATE' && (
                        <p className="text-yellow-600 text-xs mt-1">Please update your employer</p>
                      )}
                      {!userData?.employer && (
                        <p className="text-yellow-600 text-xs mt-1">Employer is required for loan applications</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        defaultValue={userData?.occupation || ''}
                        readOnly={!isEditing}
                        className={!userData?.occupation || userData?.occupation === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                      />
                      {userData?.occupation === 'NEEDS_UPDATE' && (
                        <p className="text-yellow-600 text-xs mt-1">Please update your occupation</p>
                      )}
                      {!userData?.occupation && (
                        <p className="text-yellow-600 text-xs mt-1">Occupation is required for loan applications</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (R)</Label>
                    <Input
                      id="monthlyIncome"
                      defaultValue={userData?.monthlyIncome?.toString() || ''}
                      readOnly={!isEditing}
                      className={!userData?.monthlyIncome || userData?.monthlyIncome.toString() === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                    />
                    {userData?.monthlyIncome?.toString() === 'NEEDS_UPDATE' && (
                      <p className="text-yellow-600 text-xs mt-1">Please update your monthly income</p>
                    )}
                    {!userData?.monthlyIncome && (
                      <p className="text-yellow-600 text-xs mt-1">Monthly income is required for loan applications</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Banking Information
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      defaultValue={userData?.bankName || ''}
                      readOnly={!isEditing}
                      className={!userData?.bankName || userData?.bankName === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                    />
                    {userData?.bankName === 'NEEDS_UPDATE' && (
                      <p className="text-yellow-600 text-xs mt-1">Please update your bank name</p>
                    )}
                    {!userData?.bankName && (
                      <p className="text-yellow-600 text-xs mt-1">Bank name is required for loan applications</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Input
                      id="accountType"
                      defaultValue={userData?.accountType || ''}
                      readOnly={!isEditing}
                      className={!userData?.accountType || userData?.accountType === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                    />
                    {userData?.accountType === 'NEEDS_UPDATE' && (
                      <p className="text-yellow-600 text-xs mt-1">Please update your account type</p>
                    )}
                    {!userData?.accountType && (
                      <p className="text-yellow-600 text-xs mt-1">Account type is required for loan applications</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      defaultValue={userData?.accountNumber || ''}
                      readOnly={!isEditing}
                      className={!userData?.accountNumber || userData?.accountNumber === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                    />
                    {userData?.accountNumber === 'NEEDS_UPDATE' && (
                      <p className="text-yellow-600 text-xs mt-1">Please update your account number</p>
                    )}
                    {!userData?.accountNumber && (
                      <p className="text-yellow-600 text-xs mt-1">Account number is required for loan applications</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input
                      id="accountName"
                      defaultValue={userData?.accountName || ''}
                      readOnly={!isEditing}
                      className={!userData?.accountName || userData?.accountName === 'NEEDS_UPDATE' ? 'border-yellow-500 bg-yellow-50' : ''}
                    />
                    {userData?.accountName === 'NEEDS_UPDATE' && (
                      <p className="text-yellow-600 text-xs mt-1">Please update your account holder name</p>
                    )}
                    {!userData?.accountName && (
                      <p className="text-yellow-600 text-xs mt-1">Account holder name is required for loan applications</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <ClipboardIcon className="h-4 w-4" />
                  Documents
                </h4>
                <div className="space-y-2">
                  {userData?.documents && userData.documents.length > 0 ? (
                    <div className="space-y-2">
                      {userData.documents.map((doc, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                          <span>{doc.name}</span>
                          <Button variant="ghost" size="icon">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No documents uploaded</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-start gap-4">
                  <Info className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-medium">Account Information</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since: {formatDate(userData?.createdAt)}
                      <br />
                      Last updated: {formatDate(userData?.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-center mt-4">
                  <Button variant="default" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

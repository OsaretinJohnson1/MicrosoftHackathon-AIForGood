'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Form validation interfaces
interface FormData {
  loanAmount: string;
  loanTermMonths: string;
  purpose: string;
  loanTypeId: string;
  employmentType: string;
  paymentSchedule: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  loanAmount?: string;
  loanTermMonths?: string;
  purpose?: string;
  loanTypeId?: string;
  employmentType?: string;
  paymentSchedule?: string;
  agreeToTerms?: string;
  general?: string;
}

interface ValidationState {
  loanAmount: boolean;
  loanTermMonths: boolean;
  purpose: boolean;
  loanTypeId: boolean;
  employmentType: boolean;
  paymentSchedule: boolean;
  agreeToTerms: boolean;
}

interface LoanType {
  id: number;
  name: string;
  description: string;
  minAmount?: string;
  maxAmount?: string;
  minTermMonths?: number;
  maxTermMonths?: number;
  baseInterestRate?: string;
}

interface UserProfile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  idNumber?: string;
  employer?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
  bankName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  occupation?: string;
  monthlyIncome?: string;
  ageGroup?: string;
  gender?: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [isLoadingLoanTypes, setIsLoadingLoanTypes] = useState(false);
  const [loanTypesError, setLoanTypesError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    loanAmount: '1000',
    loanTermMonths: '12',
    purpose: '',
    loanTypeId: '1',
    employmentType: 'Full-time',
    paymentSchedule: 'Monthly',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<ValidationState>({
    loanAmount: false,
    loanTermMonths: false,
    purpose: false,
    loanTypeId: false,
    employmentType: false,
    paymentSchedule: false,
    agreeToTerms: false
  });

  // Bank account types
  const accountTypes = [
    { value: "Savings", label: "Savings Account" },
    { value: "Checking", label: "Checking Account" },
    { value: "Current", label: "Current Account" },
    { value: "Business", label: "Business Account" },
    { value: "Investment", label: "Investment Account" },
    { value: "Money Market", label: "Money Market Account" },
    { value: "Other", label: "Other" }
  ];

  // Predefined loan purpose options
  const loanPurposeOptions = [
    { value: "Personal", label: "Personal Expenses" },
    { value: "Education", label: "Education" },
    { value: "Medical", label: "Medical Expenses" },
    { value: "Debt Consolidation", label: "Debt Consolidation" },
    { value: "Home Improvement", label: "Home Improvement" },
    { value: "Business", label: "Business" },
    { value: "Other", label: "Other" }
  ];
  
  // Predefined loan term options
  const loanTermOptions = [
    { value: "6", label: "6 months" },
    { value: "12", label: "12 months" },
    { value: "18", label: "18 months" },
    { value: "24", label: "24 months" },
    { value: "36", label: "36 months" },
    { value: "48", label: "48 months" },
    { value: "60", label: "60 months" }
  ];

  // Check authentication and load user profile
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Fetch user profile data
      fetchUserProfile();
      // Fetch loan types
      fetchLoanTypes();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/crud-users/user');
      const data = await response.json();
      
      if (data.success && data.data) {
        const userData = data.data;
        console.log('User profile data:', userData);
        
        // Set profile data
        setProfileData({
          id: userData.id?.toString() || '0',
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          idNumber: userData.idNumber || '',
          employer: userData.employer || '',
          accountNumber: getBankDetailsValue(userData.bankDetails, 'accountNumber'),
          accountName: getBankDetailsValue(userData.bankDetails, 'accountName'),
          accountType: getBankDetailsValue(userData.bankDetails, 'accountType'),
          bankName: getBankDetailsValue(userData.bankDetails, 'bankName'),
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          postalCode: userData.postalCode || '',
          occupation: userData.occupation || '',
          monthlyIncome: userData.incomeLevel || '',
          ageGroup: userData.ageGroup || '',
          gender: userData.gender || ''
        });
        
        // Check if profile is complete for loan application
        const missing = checkRequiredFields(userData);
        setMissingFields(missing);
        setProfileComplete(missing.length === 0);
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoanTypes = async () => {
    try {
      setIsLoadingLoanTypes(true);
      setLoanTypesError(null);
      
      const response = await fetch('/api/loan-types');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('Loan types loaded:', data.data);
        setLoanTypes(data.data);
        
        // Set the default loan type if it exists
        if (data.data.length > 0 && formData.loanTypeId === '1') {
          setFormData({
            ...formData,
            loanTypeId: data.data[0].id.toString()
          });
        }
      } else {
        console.error('Failed to load loan types or no loan types found:', data);
        setLoanTypesError('No loan types available. Please initialize loan types first.');
      }
    } catch (error) {
      console.error('Error loading loan types:', error);
      setLoanTypesError('Error loading loan types. Please try again.');
    } finally {
      setIsLoadingLoanTypes(false);
    }
  };

  const initializeLoanTypes = async () => {
    try {
      setIsLoadingLoanTypes(true);
      setLoanTypesError(null);
      
      const response = await fetch('/api/loan-types/seed-admin');
      const data = await response.json();
      
      if (data.success) {
        console.log('Loan types initialized:', data.data);
        setLoanTypes(data.data);
        toast.success('Loan types initialized successfully');
        
        // Set the default loan type if it exists
        if (data.data.length > 0) {
          setFormData({
            ...formData,
            loanTypeId: data.data[0].id.toString()
          });
        }
      } else {
        console.error('Failed to initialize loan types:', data);
        setLoanTypesError(data.message || 'Failed to initialize loan types');
        toast.error('Failed to initialize loan types');
      }
    } catch (error) {
      console.error('Error initializing loan types:', error);
      setLoanTypesError('Error initializing loan types');
      toast.error('Error initializing loan types');
    } finally {
      setIsLoadingLoanTypes(false);
    }
  };

  // Helper function to get bank details
  const getBankDetailsValue = (bankDetailsJson: string, key: string) => {
    try {
      if (!bankDetailsJson) return '';
      const bankDetails = JSON.parse(bankDetailsJson);
      return bankDetails[key] || '';
    } catch (error) {
      console.error("Error parsing bank details:", error);
      return '';
    }
  };

  // Check required fields for loan application
  const checkRequiredFields = (userData: any): string[] => {
    const missing: string[] = [];
    
    // Check personal details
    if (!userData.firstname) missing.push('First Name');
    if (!userData.lastname) missing.push('Last Name');
    if (!userData.email) missing.push('Email');
    if (!userData.phone || userData.phone === 'NEEDS_UPDATE') missing.push('Phone Number');
    if (!userData.idNumber) missing.push('ID Number');
    
    // Check employment details
    if (!userData.employer) missing.push('Employer');
    
    // Check banking details from JSON
    try {
      const bankDetails = userData.bankDetails ? JSON.parse(userData.bankDetails) : {};
      if (!bankDetails.bankName) missing.push('Bank Name');
      if (!bankDetails.accountType) missing.push('Account Type');
      if (!bankDetails.accountNumber) missing.push('Account Number');
      if (!bankDetails.accountName) missing.push('Account Holder Name');
    } catch (e) {
      missing.push('Banking Details');
    }
    
    return missing;
  };

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    if (touched[id as keyof ValidationState]) {
      const fieldError = validateField(id, value);
      setErrors({ ...errors, [id]: fieldError });
    }
  };

  const handleSelectChange = (value: string, fieldName: keyof FormData) => {
    setFormData({ ...formData, [fieldName]: value });
    
    if (touched[fieldName as keyof ValidationState]) {
      const fieldError = validateField(fieldName, value);
      setErrors({ ...errors, [fieldName]: fieldError });
    }
  };

  const handleBlur = (fieldName: keyof ValidationState) => {
    setTouched({ ...touched, [fieldName]: true });
    
    const value = formData[fieldName];
    const fieldError = validateField(fieldName, value);
    
    setErrors({ ...errors, [fieldName]: fieldError });
  };

  // Handle slider change for loan amount
  const handleSliderChange = (value: number[]) => {
    const amountValue = value[0].toString();
    setFormData({ ...formData, loanAmount: amountValue });
    
    if (touched.loanAmount) {
      const fieldError = validateField('loanAmount', amountValue);
      setErrors({ ...errors, loanAmount: fieldError });
    }
  };

  // Field validation
  const validateField = (fieldName: string, value: string | boolean): string | undefined => {
    switch (fieldName) {
      case 'loanAmount':
        if (!value) return 'Loan amount is required';
        const amount = Number(value);
        if (isNaN(amount)) return 'Please enter a valid amount';
        if (amount < 1000) return 'Loan amount must be at least 1,000';
        if (amount > 50000) return 'Loan amount cannot exceed 50,000';
        break;
      
      case 'loanTermMonths':
        if (!value) return 'Loan term is required';
        const term = Number(value);
        if (isNaN(term)) return 'Please enter a valid number of months';
        if (term < 1) return 'Loan term must be at least 1 month';
        if (term > 60) return 'Loan term cannot exceed 60 months';
        break;
      
      case 'purpose':
        if (!value) return 'Loan purpose is required';
        break;
      
      case 'loanTypeId':
        if (!value) return 'Loan type is required';
        break;
      
      case 'employmentType':
        if (!value) return 'Employment type is required';
        break;
      
      case 'paymentSchedule':
        if (!value) return 'Payment schedule is required';
        break;

      case 'agreeToTerms':
        if (value !== true) return 'You must agree to the terms and conditions';
        break;
    }
  };

  // Submit the application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    let hasErrors = false;
    
    Object.keys(formData).forEach(field => {
      const fieldName = field as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
      // Mark all fields as touched
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const applicationData = {
        loanAmount: Number(formData.loanAmount),
        loanTermMonths: Number(formData.loanTermMonths),
        purpose: formData.purpose,
        loanTypeId: Number(formData.loanTypeId),
        employmentType: formData.employmentType,
        paymentSchedule: formData.paymentSchedule
      };
      
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Application submitted successfully');
        router.push('/user-app/applications');
      } else {
        setErrors({ general: result.message || 'Failed to submit application' });
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ general: 'An unexpected error occurred' });
      toast.error('Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation between steps
  const goToNextStep = () => {
    // Validate current step before proceeding
    const fieldsToValidate: Record<number, (keyof FormData)[]> = {
      1: ['loanTypeId', 'loanAmount'],
      2: ['loanTermMonths', 'purpose'],
      3: ['paymentSchedule', 'employmentType'],
      4: ['agreeToTerms']
    };
    
    const currentFields = fieldsToValidate[currentStep];
    let hasErrors = false;
    
    // Create new errors object
    const newErrors: FormErrors = { ...errors };
    const newTouched = { ...touched };
    
    // Validate fields for current step
    currentFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      } else {
        delete newErrors[field];
      }
    });
    
    // Update touched and errors state
    setTouched(newTouched);
    setErrors(newErrors);
    
    if (!hasErrors && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return "Loan Type & Amount";
      case 2:
        return "Loan Details";
      case 3:
        return "Payment Details";
      case 4:
        return "Review & Submit";
      default:
        return "Loan Application";
    }
  };
  
  // Render form content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Loan Type */}
            <div className="space-y-3">
              <Label htmlFor="loanTypeId" className="text-base font-medium">Loan Type *</Label>
              {loanTypesError ? (
                <div className="mb-4">
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Loan Types Not Available</AlertTitle>
                    <AlertDescription>{loanTypesError}</AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={initializeLoanTypes}
                    disabled={isLoadingLoanTypes}
                  >
                    {isLoadingLoanTypes ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      'Initialize Loan Types'
                    )}
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.loanTypeId}
                  onValueChange={(value) => handleSelectChange(value, 'loanTypeId')}
                  onOpenChange={() => handleBlur('loanTypeId')}
                  disabled={isLoadingLoanTypes || loanTypes.length === 0}
                >
                  <SelectTrigger className={errors.loanTypeId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLoanTypes ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : loanTypes && loanTypes.length > 0 ? (
                      loanTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="1">No loan types available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {touched.loanTypeId && errors.loanTypeId && (
                <p className="text-red-500 text-sm mt-1">{errors.loanTypeId}</p>
              )}
              
              {/* Show selected loan type details if available */}
              {formData.loanTypeId && loanTypes.length > 0 && (
                <div className="mt-3 p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.description || ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Interest Rate:</span>{' '}
                      {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.baseInterestRate || '5'}%
                    </div>
                    <div>
                      <span className="font-medium">Available Terms:</span>{' '}
                      {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.minTermMonths || 1}-
                      {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.maxTermMonths || 60} months
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Loan Amount - Using Slider instead of Input */}
            <div className="space-y-3 mt-8">
              <Label htmlFor="loanAmount" className="text-base font-medium">Loan Amount (R) *</Label>
              <div className="pt-6 pb-2">
                <Slider
                  id="loanAmount"
                  min={1000}
                  max={50000}
                  step={500}
                  value={[parseInt(formData.loanAmount)]}
                  onValueChange={handleSliderChange}
                  onValueCommit={() => handleBlur('loanAmount')}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-sm">R1,000</span>
                <span className="text-xl font-bold">{formatCurrency(formData.loanAmount)}</span>
                <span className="text-sm">R50,000</span>
              </div>
              {touched.loanAmount && errors.loanAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.loanAmount}</p>
              )}
              <p className="text-xs text-muted-foreground">Drag the slider to select an amount between R1,000 - R50,000</p>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            {/* Loan Term */}
            <div className="space-y-3">
              <Label htmlFor="loanTermMonths" className="text-base font-medium">Loan Term *</Label>
              <Select
                value={formData.loanTermMonths}
                onValueChange={(value) => handleSelectChange(value, 'loanTermMonths')}
                onOpenChange={() => handleBlur('loanTermMonths')}
              >
                <SelectTrigger className={errors.loanTermMonths ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select loan term" />
                </SelectTrigger>
                <SelectContent>
                  {loanTermOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.loanTermMonths && errors.loanTermMonths && (
                <p className="text-red-500 text-sm mt-1">{errors.loanTermMonths}</p>
              )}
            </div>
            
            {/* Loan Purpose */}
            <div className="space-y-3 mt-8">
              <Label htmlFor="purpose" className="text-base font-medium">Loan Purpose *</Label>
              <Select
                value={formData.purpose}
                onValueChange={(value) => handleSelectChange(value, 'purpose')}
                onOpenChange={() => handleBlur('purpose')}
              >
                <SelectTrigger className={errors.purpose ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select loan purpose" />
                </SelectTrigger>
                <SelectContent>
                  {loanPurposeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.purpose && errors.purpose && (
                <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
              )}
              {formData.purpose === 'Other' && (
                <Textarea
                  placeholder="Please specify the purpose of your loan"
                  className="mt-2"
                />
              )}
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            {/* Payment Schedule */}
            <div className="space-y-3">
              <Label htmlFor="paymentSchedule" className="text-base font-medium">Payment Schedule *</Label>
              <Select
                value={formData.paymentSchedule}
                onValueChange={(value) => handleSelectChange(value, 'paymentSchedule')}
                onOpenChange={() => handleBlur('paymentSchedule')}
              >
                <SelectTrigger className={errors.paymentSchedule ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select payment schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              {touched.paymentSchedule && errors.paymentSchedule && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentSchedule}</p>
              )}
            </div>
            
            {/* Employment Type */}
            <div className="space-y-3 mt-8">
              <Label htmlFor="employmentType" className="text-base font-medium">Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => handleSelectChange(value, 'employmentType')}
                onOpenChange={() => handleBlur('employmentType')}
              >
                <SelectTrigger className={errors.employmentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Self-employed">Self-employed</SelectItem>
                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>
              {touched.employmentType && errors.employmentType && (
                <p className="text-red-500 text-sm mt-1">{errors.employmentType}</p>
              )}
            </div>
            
            {/* Profile Summary */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-3">Profile Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The following information from your profile will be used for this application:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">Personal Details</p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><span className="text-muted-foreground">Name:</span> {profileData?.firstname} {profileData?.lastname}</li>
                    <li><span className="text-muted-foreground">Email:</span> {profileData?.email}</li>
                    <li><span className="text-muted-foreground">Phone:</span> {profileData?.phone}</li>
                    <li><span className="text-muted-foreground">ID Number:</span> {profileData?.idNumber || 'Not provided'}</li>
                    {profileData?.gender && (
                      <li><span className="text-muted-foreground">Gender:</span> {profileData?.gender}</li>
                    )}
                    {profileData?.ageGroup && (
                      <li><span className="text-muted-foreground">Age Group:</span> {profileData?.ageGroup}</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Banking Details</p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><span className="text-muted-foreground">Bank:</span> {profileData?.bankName || 'Not provided'}</li>
                    <li>
                      <span className="text-muted-foreground">Account Type:</span> {
                        accountTypes.find(type => type.value === profileData?.accountType)?.label || 
                        profileData?.accountType || 
                        'Not provided'
                      }
                    </li>
                    <li><span className="text-muted-foreground">Account Number:</span> {profileData?.accountNumber || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">Account Holder:</span> {profileData?.accountName || 'Not provided'}</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Employment Information</p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><span className="text-muted-foreground">Employer:</span> {profileData?.employer || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">Occupation:</span> {profileData?.occupation || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">Monthly Income:</span> {profileData?.monthlyIncome || 'Not provided'}</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Address Information</p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><span className="text-muted-foreground">Address:</span> {profileData?.address || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">City:</span> {profileData?.city || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">State/Province:</span> {profileData?.state || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">Country:</span> {profileData?.country || 'Not provided'}</li>
                    <li><span className="text-muted-foreground">Postal Code:</span> {profileData?.postalCode || 'Not provided'}</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/user-app/profile')}
                >
                  Update Profile
                </Button>
              </div>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Application Summary</h3>
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Type</p>
                      <p className="font-medium">
                        {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.name || 'Selected Loan Type'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="font-medium">{formatCurrency(formData.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Term</p>
                      <p className="font-medium">{formData.loanTermMonths} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Interest Rate</p>
                      <p className="font-medium">
                        {loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.baseInterestRate || '5'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{formData.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Schedule</p>
                      <p className="font-medium">{formData.paymentSchedule}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency((Number(formData.loanAmount) * (1 + Number(loanTypes.find(t => t.id.toString() === formData.loanTypeId)?.baseInterestRate || 5) / 100)) / Number(formData.loanTermMonths))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This is an estimate. Final rates determined upon approval.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-top space-x-2 mb-2">
                  <Checkbox 
                    id="agreeToTerms" 
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => {
                      setFormData({...formData, agreeToTerms: checked as boolean});
                      setTouched({...touched, agreeToTerms: true});
                      if (touched.agreeToTerms) {
                        const error = validateField('agreeToTerms', checked as boolean);
                        setErrors({...errors, agreeToTerms: error});
                      }
                    }}
                    className={errors.agreeToTerms ? 'border-red-500' : ''}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By submitting this application, I confirm that all information provided is accurate and complete. 
                      I understand that UbuntuLend may verify this information and check my credit history. 
                      I agree to the <a href="/terms" className="text-primary underline">Terms of Service</a> and 
                      <a href="/privacy" className="text-primary underline"> Privacy Policy</a>.
                    </p>
                  </div>
                </div>
                {touched.agreeToTerms && errors.agreeToTerms && (
                  <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                  After submission, our team will review your application. You'll receive updates via email and in your account dashboard.
                </AlertDescription>
              </Alert>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  // Format currency function
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(numAmount);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Loan Application</h1>
        <p className="text-muted-foreground">Apply for a new loan by filling out the information below</p>
      </div>
      
      {/* Profile Validation Alert */}
      {!profileComplete && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complete your profile first</AlertTitle>
          <AlertDescription>
            <p>Your profile is incomplete. Please update the following information before applying for a loan:</p>
            <ul className="list-disc ml-6 mt-2">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
            <Button 
              className="mt-2" 
              variant="outline"
              onClick={() => router.push('/user-app/profile')}
            >
              Update Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Application Form */}
      {profileComplete && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getStepTitle(currentStep)}</CardTitle>
                  <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Progress:</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {renderStepContent()}

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">Fields marked with * are required</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? () => router.push('/user-app/applications') : goToPreviousStep}
                disabled={isSubmitting}
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={goToNextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
} 
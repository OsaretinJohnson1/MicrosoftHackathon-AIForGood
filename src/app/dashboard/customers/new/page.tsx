"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  AlertCircle,
  ArrowLeft, 
  Building, 
  Calendar, 
  CreditCard, 
  Fingerprint, 
  Mail, 
  MapPin, 
  Phone, 
  Save, 
  Shield, 
  Tags, 
  User, 
  X,
  Loader2
} from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Textarea } from "../../../../components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"
import { Switch } from "../../../../components/ui/switch"

export default function AddCustomerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    countryCode: "+27", // Default country code (South Africa)
    phone: "",
    company: "",
    address: "",
    creditLimit: "",
    joinDate: new Date().toISOString().split('T')[0], // Set default to today
    tags: "",
    notes: "",
    status: "Active",
    idNumber: "",
    isAdmin: false, // Add isAdmin field
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts editing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }))
    // Clear phone error if it exists
    if (fieldErrors['phone']) {
      setFieldErrors(prev => {
        const updated = { ...prev }
        delete updated['phone']
        return updated
      })
    }
  }
  
  const handleAdminToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAdmin: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setGeneralError(null)
    setFieldErrors({})
    setSuccess(null)
    
    try {
      // Get CSRF token from the session
      const csrfResponse = await fetch('/api/csrf');
      const { csrfToken } = await csrfResponse.json();
      
      // Prepare customer data
      const userData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        countryCode: formData.countryCode,
        phone: formData.phone,
        idNumber: formData.idNumber || undefined,
        isAdmin: formData.isAdmin ? 1 : 0, // Convert boolean to 0/1 for database
        // Generate a random temporary password
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        // Dummy recaptcha token for admin-created accounts
        recaptchaToken: "admin-created-account"
      }
      
      // Additional customer data
      const customerData = {
        company: formData.company,
        address: formData.address,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        joinDate: formData.joinDate,
        tags: formData.tags,
        notes: formData.notes,
        status: formData.status
      }
      
      // Create user account first
      const response = await fetch('/api/crud-users/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          userData,
          customerData
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        // Handle field errors
        if (result.field) {
          setFieldErrors({ [result.field]: result.error });
        } else if (result.errors && typeof result.errors === 'object') {
          // Handle multiple field errors
          setFieldErrors(result.errors);
        } else {
          throw new Error(result.error || "Failed to create customer");
        }
        return;
      }
      
      setSuccess(`Customer ${formData.firstname} ${formData.lastname} created successfully!`);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/customers");
      }, 2000);
      
    } catch (err) {
      console.error("Error creating customer:", err);
      setGeneralError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Helper function to check if a field has an error
  const hasError = (fieldName: string): boolean => {
    return !!fieldErrors[fieldName];
  }

  // Helper function to get field error message
  const getFieldError = (fieldName: string): string | null => {
    return fieldErrors[fieldName] || null;
  }

  return (
    <div className="bg-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 space-y-6 p-4 pt-6 md:p-8"
      >
        {/* Header with yellow accent */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.back()}
                className="rounded-full border-2 border-black/10 hover:bg-yellow-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Add New Customer</h2>
            </div>
          </div>
          <p className="mt-2 text-gray-500 max-w-2xl">
            Create a new customer record by filling in the information below. Required fields are marked with an asterisk (*). A welcome SMS will be sent to the customer after creation.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        
        {generalError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{generalError}</AlertDescription>
          </Alert>
        )}
        
        {/* Show summary of field errors if there are any */}
        {Object.keys(fieldErrors).length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
            <AlertTitle className="text-amber-800">Please fix the following errors:</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc list-inside text-amber-700">
                {Object.entries(fieldErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form */}
          <Card className="col-span-2 border-2 border-black/10 shadow-lg">
            <CardHeader className="border-b border-black/10 bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-500" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Enter the basic customer details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="firstname" 
                      className={`flex items-center gap-1 ${hasError('firstname') ? 'text-red-500' : ''}`}
                    >
                      <User className={`h-4 w-4 ${hasError('firstname') ? 'text-red-500' : 'text-yellow-500'}`} />
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="firstname" 
                      name="firstname" 
                      placeholder="John" 
                      className={`border-2 ${
                        hasError('firstname') 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                      } transition-all`}
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      aria-invalid={hasError('firstname')}
                      aria-errormessage={hasError('firstname') ? 'firstname-error' : undefined}
                    />
                    {hasError('firstname') && (
                      <p id="firstname-error" className="mt-1 text-sm text-red-600">{getFieldError('firstname')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="lastname" 
                      className={`flex items-center gap-1 ${hasError('lastname') ? 'text-red-500' : ''}`}
                    >
                      <User className={`h-4 w-4 ${hasError('lastname') ? 'text-red-500' : 'text-yellow-500'}`} />
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="lastname" 
                      name="lastname" 
                      placeholder="Smith" 
                      className={`border-2 ${
                        hasError('lastname') 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                      } transition-all`}
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      aria-invalid={hasError('lastname')}
                      aria-errormessage={hasError('lastname') ? 'lastname-error' : undefined}
                    />
                    {hasError('lastname') && (
                      <p id="lastname-error" className="mt-1 text-sm text-red-600">{getFieldError('lastname')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="email" 
                      className={`flex items-center gap-1 ${hasError('email') ? 'text-red-500' : ''}`}
                    >
                      <Mail className={`h-4 w-4 ${hasError('email') ? 'text-red-500' : 'text-yellow-500'}`} />
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john.smith@example.com" 
                      className={`border-2 ${
                        hasError('email') 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                      } transition-all`}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      aria-invalid={hasError('email')}
                      aria-errormessage={hasError('email') ? 'email-error' : undefined}
                    />
                    {hasError('email') && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="phone" 
                      className={`flex items-center gap-1 ${hasError('phone') ? 'text-red-500' : ''}`}
                    >
                      <Phone className={`h-4 w-4 ${hasError('phone') ? 'text-red-500' : 'text-yellow-500'}`} />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.countryCode}
                        onValueChange={handleCountryCodeChange}
                      >
                        <SelectTrigger 
                          className={`w-24 border-2 ${
                            hasError('phone') 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                          } transition-all`}
                        >
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1 (US/CA)</SelectItem>
                          <SelectItem value="+20">+20 (EG)</SelectItem>
                          <SelectItem value="+211">+211 (SS)</SelectItem>
                          <SelectItem value="+212">+212 (MA)</SelectItem>
                          <SelectItem value="+213">+213 (DZ)</SelectItem>
                          <SelectItem value="+216">+216 (TN)</SelectItem>
                          <SelectItem value="+218">+218 (LY)</SelectItem>
                          <SelectItem value="+220">+220 (GM)</SelectItem>
                          <SelectItem value="+221">+221 (SN)</SelectItem>
                          <SelectItem value="+222">+222 (MR)</SelectItem>
                          <SelectItem value="+223">+223 (ML)</SelectItem>
                          <SelectItem value="+224">+224 (GN)</SelectItem>
                          <SelectItem value="+225">+225 (CI)</SelectItem>
                          <SelectItem value="+226">+226 (BF)</SelectItem>
                          <SelectItem value="+227">+227 (NE)</SelectItem>
                          <SelectItem value="+228">+228 (TG)</SelectItem>
                          <SelectItem value="+229">+229 (BJ)</SelectItem>
                          <SelectItem value="+230">+230 (MU)</SelectItem>
                          <SelectItem value="+231">+231 (LR)</SelectItem>
                          <SelectItem value="+232">+232 (SL)</SelectItem>
                          <SelectItem value="+233">+233 (GH)</SelectItem>
                          <SelectItem value="+234">+234 (NG)</SelectItem>
                          <SelectItem value="+235">+235 (TD)</SelectItem>
                          <SelectItem value="+236">+236 (CF)</SelectItem>
                          <SelectItem value="+237">+237 (CM)</SelectItem>
                          <SelectItem value="+238">+238 (CV)</SelectItem>
                          <SelectItem value="+239">+239 (ST)</SelectItem>
                          <SelectItem value="+240">+240 (GQ)</SelectItem>
                          <SelectItem value="+241">+241 (GA)</SelectItem>
                          <SelectItem value="+242">+242 (CG)</SelectItem>
                          <SelectItem value="+243">+243 (CD)</SelectItem>
                          <SelectItem value="+244">+244 (AO)</SelectItem>
                          <SelectItem value="+245">+245 (GW)</SelectItem>
                          <SelectItem value="+246">+246 (IO)</SelectItem>
                          <SelectItem value="+248">+248 (SC)</SelectItem>
                          <SelectItem value="+249">+249 (SD)</SelectItem>
                          <SelectItem value="+250">+250 (RW)</SelectItem>
                          <SelectItem value="+251">+251 (ET)</SelectItem>
                          <SelectItem value="+252">+252 (SO)</SelectItem>
                          <SelectItem value="+253">+253 (DJ)</SelectItem>
                          <SelectItem value="+254">+254 (KE)</SelectItem>
                          <SelectItem value="+255">+255 (TZ)</SelectItem>
                          <SelectItem value="+256">+256 (UG)</SelectItem>
                          <SelectItem value="+257">+257 (BI)</SelectItem>
                          <SelectItem value="+258">+258 (MZ)</SelectItem>
                          <SelectItem value="+260">+260 (ZM)</SelectItem>
                          <SelectItem value="+261">+261 (MG)</SelectItem>
                          <SelectItem value="+262">+262 (RE)</SelectItem>
                          <SelectItem value="+263">+263 (ZW)</SelectItem>
                          <SelectItem value="+264">+264 (NA)</SelectItem>
                          <SelectItem value="+265">+265 (MW)</SelectItem>
                          <SelectItem value="+266">+266 (LS)</SelectItem>
                          <SelectItem value="+267">+267 (BW)</SelectItem>
                          <SelectItem value="+268">+268 (SZ)</SelectItem>
                          <SelectItem value="+269">+269 (KM)</SelectItem>
                          <SelectItem value="+27">+27 (ZA)</SelectItem>
                          <SelectItem value="+291">+291 (ER)</SelectItem>
                          <SelectItem value="+297">+297 (AW)</SelectItem>
                          <SelectItem value="+298">+298 (FO)</SelectItem>
                          <SelectItem value="+299">+299 (GL)</SelectItem>
                          <SelectItem value="+30">+30 (GR)</SelectItem>
                          <SelectItem value="+31">+31 (NL)</SelectItem>
                          <SelectItem value="+32">+32 (BE)</SelectItem>
                          <SelectItem value="+33">+33 (FR)</SelectItem>
                          <SelectItem value="+34">+34 (ES)</SelectItem>
                          <SelectItem value="+350">+350 (GI)</SelectItem>
                          <SelectItem value="+351">+351 (PT)</SelectItem>
                          <SelectItem value="+352">+352 (LU)</SelectItem>
                          <SelectItem value="+353">+353 (IE)</SelectItem>
                          <SelectItem value="+354">+354 (IS)</SelectItem>
                          <SelectItem value="+355">+355 (AL)</SelectItem>
                          <SelectItem value="+356">+356 (MT)</SelectItem>
                          <SelectItem value="+357">+357 (CY)</SelectItem>
                          <SelectItem value="+358">+358 (FI)</SelectItem>
                          <SelectItem value="+359">+359 (BG)</SelectItem>
                          <SelectItem value="+36">+36 (HU)</SelectItem>
                          <SelectItem value="+370">+370 (LT)</SelectItem>
                          <SelectItem value="+371">+371 (LV)</SelectItem>
                          <SelectItem value="+372">+372 (EE)</SelectItem>
                          <SelectItem value="+373">+373 (MD)</SelectItem>
                          <SelectItem value="+374">+374 (AM)</SelectItem>
                          <SelectItem value="+375">+375 (BY)</SelectItem>
                          <SelectItem value="+376">+376 (AD)</SelectItem>
                          <SelectItem value="+377">+377 (MC)</SelectItem>
                          <SelectItem value="+378">+378 (SM)</SelectItem>
                          <SelectItem value="+380">+380 (UA)</SelectItem>
                          <SelectItem value="+381">+381 (RS)</SelectItem>
                          <SelectItem value="+382">+382 (ME)</SelectItem>
                          <SelectItem value="+385">+385 (HR)</SelectItem>
                          <SelectItem value="+386">+386 (SI)</SelectItem>
                          <SelectItem value="+387">+387 (BA)</SelectItem>
                          <SelectItem value="+389">+389 (MK)</SelectItem>
                          <SelectItem value="+39">+39 (IT)</SelectItem>
                          <SelectItem value="+40">+40 (RO)</SelectItem>
                          <SelectItem value="+41">+41 (CH)</SelectItem>
                          <SelectItem value="+420">+420 (CZ)</SelectItem>
                          <SelectItem value="+421">+421 (SK)</SelectItem>
                          <SelectItem value="+423">+423 (LI)</SelectItem>
                          <SelectItem value="+43">+43 (AT)</SelectItem>
                          <SelectItem value="+44">+44 (GB)</SelectItem>
                          <SelectItem value="+45">+45 (DK)</SelectItem>
                          <SelectItem value="+46">+46 (SE)</SelectItem>
                          <SelectItem value="+47">+47 (NO)</SelectItem>
                          <SelectItem value="+48">+48 (PL)</SelectItem>
                          <SelectItem value="+49">+49 (DE)</SelectItem>
                          <SelectItem value="+500">+500 (FK)</SelectItem>
                          <SelectItem value="+501">+501 (BZ)</SelectItem>
                          <SelectItem value="+502">+502 (GT)</SelectItem>
                          <SelectItem value="+503">+503 (SV)</SelectItem>
                          <SelectItem value="+504">+504 (HN)</SelectItem>
                          <SelectItem value="+505">+505 (NI)</SelectItem>
                          <SelectItem value="+506">+506 (CR)</SelectItem>
                          <SelectItem value="+507">+507 (PA)</SelectItem>
                          <SelectItem value="+509">+509 (HT)</SelectItem>
                          <SelectItem value="+51">+51 (PE)</SelectItem>
                          <SelectItem value="+52">+52 (MX)</SelectItem>
                          <SelectItem value="+53">+53 (CU)</SelectItem>
                          <SelectItem value="+54">+54 (AR)</SelectItem>
                          <SelectItem value="+55">+55 (BR)</SelectItem>
                          <SelectItem value="+56">+56 (CL)</SelectItem>
                          <SelectItem value="+57">+57 (CO)</SelectItem>
                          <SelectItem value="+58">+58 (VE)</SelectItem>
                          <SelectItem value="+591">+591 (BO)</SelectItem>
                          <SelectItem value="+592">+592 (GY)</SelectItem>
                          <SelectItem value="+593">+593 (EC)</SelectItem>
                          <SelectItem value="+595">+595 (PY)</SelectItem>
                          <SelectItem value="+598">+598 (UY)</SelectItem>
                          <SelectItem value="+60">+60 (MY)</SelectItem>
                          <SelectItem value="+61">+61 (AU)</SelectItem>
                          <SelectItem value="+62">+62 (ID)</SelectItem>
                          <SelectItem value="+63">+63 (PH)</SelectItem>
                          <SelectItem value="+64">+64 (NZ)</SelectItem>
                          <SelectItem value="+65">+65 (SG)</SelectItem>
                          <SelectItem value="+66">+66 (TH)</SelectItem>
                          <SelectItem value="+673">+673 (BN)</SelectItem>
                          <SelectItem value="+674">+674 (NR)</SelectItem>
                          <SelectItem value="+675">+675 (PG)</SelectItem>
                          <SelectItem value="+676">+676 (TO)</SelectItem>
                          <SelectItem value="+677">+677 (SB)</SelectItem>
                          <SelectItem value="+678">+678 (VU)</SelectItem>
                          <SelectItem value="+679">+679 (FJ)</SelectItem>
                          <SelectItem value="+680">+680 (PW)</SelectItem>
                          <SelectItem value="+681">+681 (WF)</SelectItem>
                          <SelectItem value="+682">+682 (CK)</SelectItem>
                          <SelectItem value="+683">+683 (NU)</SelectItem>
                          <SelectItem value="+685">+685 (WS)</SelectItem>
                          <SelectItem value="+686">+686 (KI)</SelectItem>
                          <SelectItem value="+687">+687 (NC)</SelectItem>
                          <SelectItem value="+688">+688 (TV)</SelectItem>
                          <SelectItem value="+689">+689 (PF)</SelectItem>
                          <SelectItem value="+690">+690 (TK)</SelectItem>
                          <SelectItem value="+691">+691 (FM)</SelectItem>
                          <SelectItem value="+692">+692 (MH)</SelectItem>
                          <SelectItem value="+7">+7 (RU/KZ)</SelectItem>
                          <SelectItem value="+81">+81 (JP)</SelectItem>
                          <SelectItem value="+82">+82 (KR)</SelectItem>
                          <SelectItem value="+84">+84 (VN)</SelectItem>
                          <SelectItem value="+850">+850 (KP)</SelectItem>
                          <SelectItem value="+852">+852 (HK)</SelectItem>
                          <SelectItem value="+853">+853 (MO)</SelectItem>
                          <SelectItem value="+855">+855 (KH)</SelectItem>
                          <SelectItem value="+856">+856 (LA)</SelectItem>
                          <SelectItem value="+86">+86 (CN)</SelectItem>
                          <SelectItem value="+880">+880 (BD)</SelectItem>
                          <SelectItem value="+886">+886 (TW)</SelectItem>
                          <SelectItem value="+90">+90 (TR)</SelectItem>
                          <SelectItem value="+91">+91 (IN)</SelectItem>
                          <SelectItem value="+92">+92 (PK)</SelectItem>
                          <SelectItem value="+93">+93 (AF)</SelectItem>
                          <SelectItem value="+94">+94 (LK)</SelectItem>
                          <SelectItem value="+95">+95 (MM)</SelectItem>
                          <SelectItem value="+960">+960 (MV)</SelectItem>
                          <SelectItem value="+961">+961 (LB)</SelectItem>
                          <SelectItem value="+962">+962 (JO)</SelectItem>
                          <SelectItem value="+963">+963 (SY)</SelectItem>
                          <SelectItem value="+964">+964 (IQ)</SelectItem>
                          <SelectItem value="+965">+965 (KW)</SelectItem>
                          <SelectItem value="+966">+966 (SA)</SelectItem>
                          <SelectItem value="+967">+967 (YE)</SelectItem>
                          <SelectItem value="+968">+968 (OM)</SelectItem>
                          <SelectItem value="+970">+970 (PS)</SelectItem>
                          <SelectItem value="+971">+971 (AE)</SelectItem>
                          <SelectItem value="+972">+972 (IL)</SelectItem>
                          <SelectItem value="+973">+973 (BH)</SelectItem>
                          <SelectItem value="+974">+974 (QA)</SelectItem>
                          <SelectItem value="+975">+975 (BT)</SelectItem>
                          <SelectItem value="+976">+976 (MN)</SelectItem>
                          <SelectItem value="+977">+977 (NP)</SelectItem>
                          <SelectItem value="+98">+98 (IR)</SelectItem>
                          <SelectItem value="+992">+992 (TJ)</SelectItem>
                          <SelectItem value="+993">+993 (TM)</SelectItem>
                          <SelectItem value="+994">+994 (AZ)</SelectItem>
                          <SelectItem value="+995">+995 (GE)</SelectItem>
                          <SelectItem value="+996">+996 (KG)</SelectItem>
                          <SelectItem value="+998">+998 (UZ)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="712345678" 
                        className={`flex-1 border-2 ${
                          hasError('phone') 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                        } transition-all`}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        aria-invalid={hasError('phone')}
                        aria-errormessage={hasError('phone') ? 'phone-error' : undefined}
                      />
                    </div>
                    {hasError('phone') && (
                      <p id="phone-error" className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="idNumber" 
                      className={`flex items-center gap-1 ${hasError('idNumber') ? 'text-red-500' : ''}`}
                    >
                      <Fingerprint className={`h-4 w-4 ${hasError('idNumber') ? 'text-red-500' : 'text-yellow-500'}`} />
                      ID Number
                    </Label>
                    <Input 
                      id="idNumber" 
                      name="idNumber" 
                      placeholder="National ID / Passport Number" 
                      className={`border-2 ${
                        hasError('idNumber') 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-black/10 focus:border-yellow-500 focus:ring-yellow-500'
                      } transition-all`}
                      value={formData.idNumber}
                      onChange={handleChange}
                      aria-invalid={hasError('idNumber')}
                      aria-errormessage={hasError('idNumber') ? 'idNumber-error' : undefined}
                    />
                    {hasError('idNumber') && (
                      <p id="idNumber-error" className="mt-1 text-sm text-red-600">{getFieldError('idNumber')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-yellow-500" />
                      Company
                    </Label>
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Acme Inc." 
                      className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      Address
                    </Label>
                    <Input 
                      id="address" 
                      name="address" 
                      placeholder="123 Main St, City, State, Zip" 
                      className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="creditLimit" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-yellow-500" />
                      Credit Limit
                    </Label>
                    <Input 
                      id="creditLimit" 
                      name="creditLimit" 
                      placeholder="$10,000" 
                      className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      value={formData.creditLimit}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joinDate" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                      Join Date
                    </Label>
                    <Input 
                      id="joinDate" 
                      name="joinDate" 
                      type="date" 
                      className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      value={formData.joinDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-1">
                      <Fingerprint className="h-4 w-4 text-yellow-500" />
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      defaultValue={formData.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger 
                        id="status" 
                        className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Admin Toggle */}
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isAdmin" className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        Admin User
                      </Label>
                      <Switch 
                        id="isAdmin" 
                        checked={formData.isAdmin}
                        onCheckedChange={handleAdminToggle}
                        className="data-[state=checked]:bg-yellow-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {formData.isAdmin ? 
                        "This user will have administrative privileges." : 
                        "This user will have standard customer privileges."}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags" className="flex items-center gap-1">
                    <Tags className="h-4 w-4 text-yellow-500" />
                    Tags (comma separated)
                  </Label>
                  <Input 
                    id="tags" 
                    name="tags" 
                    placeholder="VIP, Wholesale, New" 
                    className="border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Add any relevant notes about this customer..." 
                    className="min-h-[100px] border-2 border-black/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-2 border-black/10 hover:bg-gray-50 transition-colors"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium shadow-md hover:shadow-lg transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Customer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Sidebar card with tips */}
          <Card className="border-2 border-black/10 shadow-lg h-fit">
            <CardHeader className="border-b border-black/10 bg-yellow-50">
              <CardTitle className="text-lg">Tips for Adding Customers</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <p className="font-medium">Complete all required fields</p>
                  <p className="text-gray-600 mt-1">Make sure to fill out all fields marked with an asterisk (*) to successfully create the customer.</p>
                </div>
                
                <div className="p-3 bg-gray-50 border-l-4 border-gray-200 rounded">
                  <p className="font-medium">Phone number format</p>
                  <p className="text-gray-600 mt-1">Enter the phone number without the country code (e.g., 712345678). Select the country code from the dropdown.</p>
                </div>
                
                <div className="p-3 bg-gray-50 border-l-4 border-gray-200 rounded">
                  <p className="font-medium">Customer tags are searchable</p>
                  <p className="text-gray-600 mt-1">Adding relevant tags makes it easier to find and categorize customers later.</p>
                </div>
                
                <div className="p-3 bg-gray-50 border-l-4 border-gray-200 rounded">
                  <p className="font-medium">ID number is optional</p>
                  <p className="text-gray-600 mt-1">Adding a national ID or passport number can help with customer verification later.</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <p className="font-medium">Admin privileges</p>
                  <p className="text-gray-600 mt-1">Toggle the admin switch to grant administrative access to this user. Use with caution as admins have full system access.</p>
                </div>
                
                <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="font-medium">Automatic notifications</p>
                  <p className="text-gray-600 mt-1">A welcome SMS will be automatically sent to the customer's phone number upon creation.</p>
                </div>
                
                <div className="mt-6 p-4 bg-black/5 rounded-lg">
                  <h4 className="font-medium flex items-center">
                    <Fingerprint className="h-4 w-4 mr-2 text-yellow-500" />
                    Customer ID Generation
                  </h4>
                  <p className="text-gray-600 mt-1 text-sm">A unique customer ID will be automatically generated when you save this form.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
} 
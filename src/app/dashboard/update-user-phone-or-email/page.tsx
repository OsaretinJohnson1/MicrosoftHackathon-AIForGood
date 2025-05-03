"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Send, User, Mail, Phone, Lock, Check, ChevronDown, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Country codes array with dial codes
const countryCodes = [
  { code: "AF", name: "Afghanistan", dial_code: "+93" },
  { code: "AL", name: "Albania", dial_code: "+355" },
  { code: "DZ", name: "Algeria", dial_code: "+213" },
  { code: "AS", name: "American Samoa", dial_code: "+1684" },
  { code: "AD", name: "Andorra", dial_code: "+376" },
  { code: "AO", name: "Angola", dial_code: "+244" },
  { code: "AI", name: "Anguilla", dial_code: "+1264" },
  { code: "AQ", name: "Antarctica", dial_code: "+672" },
  { code: "AG", name: "Antigua and Barbuda", dial_code: "+1268" },
  { code: "AR", name: "Argentina", dial_code: "+54" },
  { code: "AM", name: "Armenia", dial_code: "+374" },
  { code: "AW", name: "Aruba", dial_code: "+297" },
  { code: "AU", name: "Australia", dial_code: "+61" },
  { code: "AT", name: "Austria", dial_code: "+43" },
  { code: "AZ", name: "Azerbaijan", dial_code: "+994" },
  { code: "BS", name: "Bahamas", dial_code: "+1242" },
  { code: "BH", name: "Bahrain", dial_code: "+973" },
  { code: "BD", name: "Bangladesh", dial_code: "+880" },
  { code: "BB", name: "Barbados", dial_code: "+1246" },
  { code: "BY", name: "Belarus", dial_code: "+375" },
  { code: "BE", name: "Belgium", dial_code: "+32" },
  { code: "BZ", name: "Belize", dial_code: "+501" },
  { code: "BJ", name: "Benin", dial_code: "+229" },
  { code: "BM", name: "Bermuda", dial_code: "+1441" },
  { code: "BT", name: "Bhutan", dial_code: "+975" },
  { code: "BO", name: "Bolivia", dial_code: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial_code: "+387" },
  { code: "BW", name: "Botswana", dial_code: "+267" },
  { code: "BR", name: "Brazil", dial_code: "+55" },
  { code: "IO", name: "British Indian Ocean Territory", dial_code: "+246" },
  { code: "BN", name: "Brunei Darussalam", dial_code: "+673" },
  { code: "BG", name: "Bulgaria", dial_code: "+359" },
  { code: "BF", name: "Burkina Faso", dial_code: "+226" },
  { code: "BI", name: "Burundi", dial_code: "+257" },
  { code: "KH", name: "Cambodia", dial_code: "+855" },
  { code: "CM", name: "Cameroon", dial_code: "+237" },
  { code: "CA", name: "Canada", dial_code: "+1" },
  { code: "CV", name: "Cape Verde", dial_code: "+238" },
  { code: "KY", name: "Cayman Islands", dial_code: "+1345" },
  { code: "CF", name: "Central African Republic", dial_code: "+236" },
  { code: "TD", name: "Chad", dial_code: "+235" },
  { code: "CL", name: "Chile", dial_code: "+56" },
  { code: "CN", name: "China", dial_code: "+86" },
  { code: "CX", name: "Christmas Island", dial_code: "+61" },
  { code: "CC", name: "Cocos (Keeling) Islands", dial_code: "+61" },
  { code: "CO", name: "Colombia", dial_code: "+57" },
  { code: "KM", name: "Comoros", dial_code: "+269" },
  { code: "CG", name: "Congo", dial_code: "+242" },
  { code: "CD", name: "Congo, Democratic Republic", dial_code: "+243" },
  { code: "CK", name: "Cook Islands", dial_code: "+682" },
  { code: "CR", name: "Costa Rica", dial_code: "+506" },
  { code: "CI", name: "Cote d'Ivoire", dial_code: "+225" },
  { code: "HR", name: "Croatia", dial_code: "+385" },
  { code: "CU", name: "Cuba", dial_code: "+53" },
  { code: "CY", name: "Cyprus", dial_code: "+357" },
  { code: "CZ", name: "Czech Republic", dial_code: "+420" },
  { code: "DK", name: "Denmark", dial_code: "+45" },
  { code: "DJ", name: "Djibouti", dial_code: "+253" },
  { code: "DM", name: "Dominica", dial_code: "+1767" },
  { code: "DO", name: "Dominican Republic", dial_code: "+1849" },
  { code: "EC", name: "Ecuador", dial_code: "+593" },
  { code: "EG", name: "Egypt", dial_code: "+20" },
  { code: "SV", name: "El Salvador", dial_code: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial_code: "+240" },
  { code: "ER", name: "Eritrea", dial_code: "+291" },
  { code: "EE", name: "Estonia", dial_code: "+372" },
  { code: "ET", name: "Ethiopia", dial_code: "+251" },
  { code: "FK", name: "Falkland Islands", dial_code: "+500" },
  { code: "FO", name: "Faroe Islands", dial_code: "+298" },
  { code: "FJ", name: "Fiji", dial_code: "+679" },
  { code: "FI", name: "Finland", dial_code: "+358" },
  { code: "FR", name: "France", dial_code: "+33" },
  { code: "GF", name: "French Guiana", dial_code: "+594" },
  { code: "PF", name: "French Polynesia", dial_code: "+689" },
  { code: "GA", name: "Gabon", dial_code: "+241" },
  { code: "GM", name: "Gambia", dial_code: "+220" },
  { code: "GE", name: "Georgia", dial_code: "+995" },
  { code: "DE", name: "Germany", dial_code: "+49" },
  { code: "GH", name: "Ghana", dial_code: "+233" },
  { code: "GI", name: "Gibraltar", dial_code: "+350" },
  { code: "GR", name: "Greece", dial_code: "+30" },
  { code: "GL", name: "Greenland", dial_code: "+299" },
  { code: "GD", name: "Grenada", dial_code: "+1473" },
  { code: "GP", name: "Guadeloupe", dial_code: "+590" },
  { code: "GU", name: "Guam", dial_code: "+1671" },
  { code: "GT", name: "Guatemala", dial_code: "+502" },
  { code: "GG", name: "Guernsey", dial_code: "+44" },
  { code: "GN", name: "Guinea", dial_code: "+224" },
  { code: "GW", name: "Guinea-Bissau", dial_code: "+245" },
  { code: "GY", name: "Guyana", dial_code: "+592" },
  { code: "HT", name: "Haiti", dial_code: "+509" },
  { code: "VA", name: "Holy See (Vatican City)", dial_code: "+379" },
  { code: "HN", name: "Honduras", dial_code: "+504" },
  { code: "HK", name: "Hong Kong", dial_code: "+852" },
  { code: "HU", name: "Hungary", dial_code: "+36" },
  { code: "IS", name: "Iceland", dial_code: "+354" },
  { code: "IN", name: "India", dial_code: "+91" },
  { code: "ID", name: "Indonesia", dial_code: "+62" },
  { code: "IR", name: "Iran", dial_code: "+98" },
  { code: "IQ", name: "Iraq", dial_code: "+964" },
  { code: "IE", name: "Ireland", dial_code: "+353" },
  { code: "IM", name: "Isle of Man", dial_code: "+44" },
  { code: "IL", name: "Israel", dial_code: "+972" },
  { code: "IT", name: "Italy", dial_code: "+39" },
  { code: "JM", name: "Jamaica", dial_code: "+1876" },
  { code: "JP", name: "Japan", dial_code: "+81" },
  { code: "JE", name: "Jersey", dial_code: "+44" },
  { code: "JO", name: "Jordan", dial_code: "+962" },
  { code: "KZ", name: "Kazakhstan", dial_code: "+7" },
  { code: "KE", name: "Kenya", dial_code: "+254" },
  { code: "KI", name: "Kiribati", dial_code: "+686" },
  { code: "KP", name: "Korea, North", dial_code: "+850" },
  { code: "KR", name: "Korea, South", dial_code: "+82" },
  { code: "KW", name: "Kuwait", dial_code: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial_code: "+996" },
  { code: "LA", name: "Laos", dial_code: "+856" },
  { code: "LV", name: "Latvia", dial_code: "+371" },
  { code: "LB", name: "Lebanon", dial_code: "+961" },
  { code: "LS", name: "Lesotho", dial_code: "+266" },
  { code: "LR", name: "Liberia", dial_code: "+231" },
  { code: "LY", name: "Libya", dial_code: "+218" },
  { code: "LI", name: "Liechtenstein", dial_code: "+423" },
  { code: "LT", name: "Lithuania", dial_code: "+370" },
  { code: "LU", name: "Luxembourg", dial_code: "+352" },
  { code: "MO", name: "Macao", dial_code: "+853" },
  { code: "MK", name: "Macedonia", dial_code: "+389" },
  { code: "MG", name: "Madagascar", dial_code: "+261" },
  { code: "MW", name: "Malawi", dial_code: "+265" },
  { code: "MY", name: "Malaysia", dial_code: "+60" },
  { code: "MV", name: "Maldives", dial_code: "+960" },
  { code: "ML", name: "Mali", dial_code: "+223" },
  { code: "MT", name: "Malta", dial_code: "+356" },
  { code: "MH", name: "Marshall Islands", dial_code: "+692" },
  { code: "MQ", name: "Martinique", dial_code: "+596" },
  { code: "MR", name: "Mauritania", dial_code: "+222" },
  { code: "MU", name: "Mauritius", dial_code: "+230" },
  { code: "YT", name: "Mayotte", dial_code: "+262" },
  { code: "MX", name: "Mexico", dial_code: "+52" },
  { code: "FM", name: "Micronesia", dial_code: "+691" },
  { code: "MD", name: "Moldova", dial_code: "+373" },
  { code: "MC", name: "Monaco", dial_code: "+377" },
  { code: "MN", name: "Mongolia", dial_code: "+976" },
  { code: "ME", name: "Montenegro", dial_code: "+382" },
  { code: "MS", name: "Montserrat", dial_code: "+1664" },
  { code: "MA", name: "Morocco", dial_code: "+212" },
  { code: "MZ", name: "Mozambique", dial_code: "+258" },
  { code: "MM", name: "Myanmar", dial_code: "+95" },
  { code: "NA", name: "Namibia", dial_code: "+264" },
  { code: "NR", name: "Nauru", dial_code: "+674" },
  { code: "NP", name: "Nepal", dial_code: "+977" },
  { code: "NL", name: "Netherlands", dial_code: "+31" },
  { code: "NC", name: "New Caledonia", dial_code: "+687" },
  { code: "NZ", name: "New Zealand", dial_code: "+64" },
  { code: "NI", name: "Nicaragua", dial_code: "+505" },
  { code: "NE", name: "Niger", dial_code: "+227" },
  { code: "NG", name: "Nigeria", dial_code: "+234" },
  { code: "NU", name: "Niue", dial_code: "+683" },
  { code: "NF", name: "Norfolk Island", dial_code: "+672" },
  { code: "MP", name: "Northern Mariana Islands", dial_code: "+1670" },
  { code: "NO", name: "Norway", dial_code: "+47" },
  { code: "OM", name: "Oman", dial_code: "+968" },
  { code: "PK", name: "Pakistan", dial_code: "+92" },
  { code: "PW", name: "Palau", dial_code: "+680" },
  { code: "PS", name: "Palestine", dial_code: "+970" },
  { code: "PA", name: "Panama", dial_code: "+507" },
  { code: "PG", name: "Papua New Guinea", dial_code: "+675" },
  { code: "PY", name: "Paraguay", dial_code: "+595" },
  { code: "PE", name: "Peru", dial_code: "+51" },
  { code: "PH", name: "Philippines", dial_code: "+63" },
  { code: "PN", name: "Pitcairn", dial_code: "+64" },
  { code: "PL", name: "Poland", dial_code: "+48" },
  { code: "PT", name: "Portugal", dial_code: "+351" },
  { code: "PR", name: "Puerto Rico", dial_code: "+1939" },
  { code: "QA", name: "Qatar", dial_code: "+974" },
  { code: "RE", name: "Reunion", dial_code: "+262" },
  { code: "RO", name: "Romania", dial_code: "+40" },
  { code: "RU", name: "Russia", dial_code: "+7" },
  { code: "RW", name: "Rwanda", dial_code: "+250" },
  { code: "BL", name: "Saint Barthelemy", dial_code: "+590" },
  { code: "SH", name: "Saint Helena", dial_code: "+290" },
  { code: "KN", name: "Saint Kitts and Nevis", dial_code: "+1869" },
  { code: "LC", name: "Saint Lucia", dial_code: "+1758" },
  { code: "MF", name: "Saint Martin", dial_code: "+590" },
  { code: "PM", name: "Saint Pierre and Miquelon", dial_code: "+508" },
  { code: "VC", name: "Saint Vincent and Grenadines", dial_code: "+1784" },
  { code: "WS", name: "Samoa", dial_code: "+685" },
  { code: "SM", name: "San Marino", dial_code: "+378" },
  { code: "ST", name: "Sao Tome and Principe", dial_code: "+239" },
  { code: "SA", name: "Saudi Arabia", dial_code: "+966" },
  { code: "SN", name: "Senegal", dial_code: "+221" },
  { code: "RS", name: "Serbia", dial_code: "+381" },
  { code: "SC", name: "Seychelles", dial_code: "+248" },
  { code: "SL", name: "Sierra Leone", dial_code: "+232" },
  { code: "SG", name: "Singapore", dial_code: "+65" },
  { code: "SK", name: "Slovakia", dial_code: "+421" },
  { code: "SI", name: "Slovenia", dial_code: "+386" },
  { code: "SB", name: "Solomon Islands", dial_code: "+677" },
  { code: "SO", name: "Somalia", dial_code: "+252" },
  { code: "ZA", name: "South Africa", dial_code: "+27" },
  { code: "SS", name: "South Sudan", dial_code: "+211" },
  { code: "ES", name: "Spain", dial_code: "+34" },
  { code: "LK", name: "Sri Lanka", dial_code: "+94" },
  { code: "SD", name: "Sudan", dial_code: "+249" },
  { code: "SR", name: "Suriname", dial_code: "+597" },
  { code: "SJ", name: "Svalbard and Jan Mayen", dial_code: "+47" },
  { code: "SZ", name: "Swaziland", dial_code: "+268" },
  { code: "SE", name: "Sweden", dial_code: "+46" },
  { code: "CH", name: "Switzerland", dial_code: "+41" },
  { code: "SY", name: "Syria", dial_code: "+963" },
  { code: "TW", name: "Taiwan", dial_code: "+886" },
  { code: "TJ", name: "Tajikistan", dial_code: "+992" },
  { code: "TZ", name: "Tanzania", dial_code: "+255" },
  { code: "TH", name: "Thailand", dial_code: "+66" },
  { code: "TL", name: "Timor-Leste", dial_code: "+670" },
  { code: "TG", name: "Togo", dial_code: "+228" },
  { code: "TK", name: "Tokelau", dial_code: "+690" },
  { code: "TO", name: "Tonga", dial_code: "+676" },
  { code: "TT", name: "Trinidad and Tobago", dial_code: "+1868" },
  { code: "TN", name: "Tunisia", dial_code: "+216" },
  { code: "TR", name: "Turkey", dial_code: "+90" },
  { code: "TM", name: "Turkmenistan", dial_code: "+993" },
  { code: "TC", name: "Turks and Caicos Islands", dial_code: "+1649" },
  { code: "TV", name: "Tuvalu", dial_code: "+688" },
  { code: "UG", name: "Uganda", dial_code: "+256" },
  { code: "UA", name: "Ukraine", dial_code: "+380" },
  { code: "AE", name: "United Arab Emirates", dial_code: "+971" },
  { code: "GB", name: "United Kingdom", dial_code: "+44" },
  { code: "US", name: "United States", dial_code: "+1" },
  { code: "UY", name: "Uruguay", dial_code: "+598" },
  { code: "UZ", name: "Uzbekistan", dial_code: "+998" },
  { code: "VU", name: "Vanuatu", dial_code: "+678" },
  { code: "VE", name: "Venezuela", dial_code: "+58" },
  { code: "VN", name: "Vietnam", dial_code: "+84" },
  { code: "VG", name: "Virgin Islands, British", dial_code: "+1284" },
  { code: "VI", name: "Virgin Islands, U.S.", dial_code: "+1340" },
  { code: "WF", name: "Wallis and Futuna", dial_code: "+681" },
  { code: "YE", name: "Yemen", dial_code: "+967" },
  { code: "ZM", name: "Zambia", dial_code: "+260" },
  { code: "ZW", name: "Zimbabwe", dial_code: "+263" }
];

// Form validation schema
const updateContactSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(val => String(val)),
  contactType: z.enum(["email", "phone"]),
  contactValue: z.string().min(1, "Contact value is required"),
  countryCode: z.string().optional(),
})

type FormData = z.infer<typeof updateContactSchema>

export default function UpdateUserContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    userId: "",
    contactType: "email",
    contactValue: "",
    countryCode: "+27" // Default to South Africa
  })
  const [userSearchInput, setUserSearchInput] = useState("")
  const [searchedUser, setSearchedUser] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showCountryList, setShowCountryList] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  // Filter countries based on search term
  const filteredCountries = countrySearch 
    ? countryCodes.filter(country => 
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
        country.dial_code.includes(countrySearch))
    : countryCodes

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showCountryList) {
        const target = e.target as HTMLElement
        if (!target.closest('.country-selector')) {
          setShowCountryList(false)
        }
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showCountryList])

  // Handle user search
  const handleUserSearch = async () => {
    if (!userSearchInput) {
      toast.error("Please enter an email, phone or user ID to search")
      return
    }
    
    setIsSearching(true)
    setSearchedUser(null)
    setFormData(prev => ({ ...prev, userId: "" }))
    
    try {
      const response = await fetch(`/api/admin/search-user?query=${encodeURIComponent(userSearchInput)}`)
      const data = await response.json()
      
      if (response.ok && data.user) {
        setSearchedUser(data.user)
        setFormData(prev => ({ 
          ...prev, 
          userId: data.user.id,
          contactValue: "",
        }))
        toast.success("User found")
      } else {
        toast.error(data.error || "User not found")
      }
    } catch (error) {
      console.error("Error searching for user:", error)
      toast.error("Failed to search for user")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Handle country code selection
  const handleCountryCodeSelect = (dialCode: string) => {
    setFormData(prev => ({ ...prev, countryCode: dialCode }))
    setShowCountryList(false)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    
    // Validate the form data
    try {
      updateContactSchema.parse(formData)
      setErrors({})
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message
          }
        })
        setErrors(fieldErrors)
        return
      }
    }

    setIsProcessing(true)

    // Format contact value for phone if needed
    let contactValue = formData.contactValue
    if (formData.contactType === "phone") {
      // If the phone number starts with "0", remove it
      const phoneNumber = formData.contactValue.startsWith("0") 
        ? formData.contactValue.substring(1) 
        : formData.contactValue
      
      contactValue = phoneNumber
    }

    try {
      // Call the API endpoint to update the user contact
      const response = await fetch('/api/admin/update-user-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: String(formData.userId), // Ensure userId is sent as a string
          contactType: formData.contactType,
          contactValue: contactValue,
          countryCode: formData.contactType === "phone" ? formData.countryCode : undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Contact has been updated.",
        })
        toast.success("Contact has been updated.")
       
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to update contact.",
        })
        toast.error(data.error || "Failed to update contact.")
      }
    } catch (error) {
      console.error("Error updating contact:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      })
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Update User Contact</h2>
          <p className="text-muted-foreground">Update a user's contact information and send them a notification</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Update User Contact Information</CardTitle>
              <CardDescription>
                Search for a user, then update <strong>either</strong> their email address <strong>or</strong> phone number (one at a time)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="update-contact-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userSearchInput">
                    Search User
                  </Label>
                  <div className="flex items-stretch gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        <Search className="h-5 w-5" />
                      </span>
                      <Input
                        id="userSearchInput"
                        name="userSearchInput"
                        placeholder="Search by email, phone, or user ID"
                        className="pl-10"
                        value={userSearchInput}
                        onChange={(e) => setUserSearchInput(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleUserSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </div>

                {searchedUser && (
                  <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
                          <User className="h-5 w-5 text-green-600 dark:text-green-50" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">
                            {searchedUser.firstname} {searchedUser.lastname}
                          </p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>ID: {searchedUser.id}</p>
                            {searchedUser.email && <p>Email: {searchedUser.email}</p>}
                            {searchedUser.phone && <p>Phone: {searchedUser.phone}</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="userId">
                    User ID
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      <User className="h-5 w-5" />
                    </span>
                    <Input
                      id="userId"
                      name="userId"
                      placeholder="User ID"
                      className="pl-10"
                      value={formData.userId}
                      onChange={handleChange}
                      readOnly={!!searchedUser}
                    />
                  </div>
                  {errors.userId && (
                    <p className="text-sm text-destructive">{errors.userId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Contact Type to Update</Label>
                  <RadioGroup
                    value={formData.contactType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contactType: value as "email" | "phone" }))}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="email" id="type-email" />
                      <Label htmlFor="type-email" className="flex items-center gap-2 cursor-pointer">
                        <Mail className="h-4 w-4" />
                        <span>Update Email Address</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="phone" id="type-phone" />
                      <Label htmlFor="type-phone" className="flex items-center gap-2 cursor-pointer">
                        <Phone className="h-4 w-4" />
                        <span>Update Phone Number</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    <strong>Important:</strong> You can only update one contact type at a time. If you need to update both email and phone, you must submit two separate updates.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactValue">
                    {formData.contactType === "email" ? "New Email Address" : "New Phone Number"}
                  </Label>
                  {formData.contactType === "phone" ? (
                    <div className="flex items-stretch">
                      <div className="relative country-selector">
                        <button
                          type="button"
                          className="flex items-center justify-between px-3 py-2 border border-r-0 border-input rounded-l-md h-10"
                          onClick={() => setShowCountryList(!showCountryList)}
                        >
                          <span className="mr-2">{formData.countryCode}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                        
                        {showCountryList && (
                          <div className="absolute z-10 mt-1 w-64 max-h-60 overflow-y-auto bg-background border border-input rounded-md shadow-lg">
                            <div className="sticky top-0 bg-background border-b border-input p-2">
                              <input
                                type="text"
                                placeholder="Search countries..."
                                className="w-full px-3 py-1 border border-input rounded bg-background text-sm"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                autoComplete="off"
                                autoFocus
                              />
                            </div>
                            <ul className="py-1">
                              {filteredCountries.map(country => (
                                <li 
                                  key={country.code}
                                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                                  onClick={() => handleCountryCodeSelect(country.dial_code)}
                                >
                                  {country.name} ({country.dial_code})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <Input
                          id="contactValue"
                          name="contactValue"
                          placeholder="Phone number"
                          className="pl-3 rounded-l-none"
                          value={formData.contactValue}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </span>
                      <Input
                        id="contactValue"
                        name="contactValue"
                        placeholder="Email address"
                        className="pl-10"
                        value={formData.contactValue}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  {errors.contactValue && (
                    <p className="text-sm text-destructive">{errors.contactValue}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    The user will be automatically notified via all available contact methods (both email and SMS if available).
                  </p>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                type="submit"
                form="update-contact-form"
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> 
                    Update Contact
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <Card className={result.success ? "border-green-500" : "border-red-500"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {result.success ? (
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-50" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-800">
                      <Lock className="h-6 w-6 text-red-600 dark:text-red-50" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">
                      {result.success ? "Contact Update Successful" : "Contact Update Failed"}
                    </h3>
                    <p className="text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
} 
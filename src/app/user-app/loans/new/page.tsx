"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Check, ChevronsUpDown, HelpCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewLoanApplicationPage() {
    const [loanAmount, setLoanAmount] = useState(5000)
    const [loanTerm, setLoanTerm] = useState(36)
    const [step, setStep] = useState(1)

    // Estimated monthly payment calculation (simplified)
    const interestRate = 0.0525 // 5.25%
    const monthlyRate = interestRate / 12
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm))

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    return (
        <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/user-app/loans">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Apply for a Loan</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>New Loan Application</CardTitle>
                                    <CardDescription>Please provide the details for your loan request</CardDescription>
                                </div>
                                <Badge>Step {step} of 4</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Loan Details</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="loan-purpose">Loan Purpose</Label>
                                            <Select defaultValue="personal">
                                                <SelectTrigger id="loan-purpose">
                                                    <SelectValue placeholder="Select purpose" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="personal">Personal Expenses</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                    <SelectItem value="medical">Medical Expenses</SelectItem>
                                                    <SelectItem value="home">Home Improvement</SelectItem>
                                                    <SelectItem value="debt">Debt Consolidation</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="loan-amount">Loan Amount: ${loanAmount.toLocaleString()}</Label>
                                                <span className="text-sm text-muted-foreground">Max: $25,000</span>
                                            </div>
                                            <Slider
                                                id="loan-amount"
                                                defaultValue={[5000]}
                                                max={25000}
                                                step={500}
                                                onValueChange={(value) => setLoanAmount(value[0])}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>$1,000</span>
                                                <span>$25,000</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="loan-term">Loan Term: {loanTerm} months</Label>
                                            </div>
                                            <Select defaultValue="36" onValueChange={(value) => setLoanTerm(parseInt(value))}>
                                                <SelectTrigger id="loan-term">
                                                    <SelectValue placeholder="Select term" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="12">12 months (1 year)</SelectItem>
                                                    <SelectItem value="24">24 months (2 years)</SelectItem>
                                                    <SelectItem value="36">36 months (3 years)</SelectItem>
                                                    <SelectItem value="48">48 months (4 years)</SelectItem>
                                                    <SelectItem value="60">60 months (5 years)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Personal Information</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first-name">First Name</Label>
                                                <Input id="first-name" placeholder="Enter your first name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last-name">Last Name</Label>
                                                <Input id="last-name" placeholder="Enter your last name" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" placeholder="Enter your email" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" placeholder="Enter your phone number" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Current Address</Label>
                                            <Input id="address" placeholder="Enter your street address" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" placeholder="City" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input id="state" placeholder="State" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zip">ZIP Code</Label>
                                                <Input id="zip" placeholder="ZIP Code" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Employment & Financial Information</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="employment">Employment Status</Label>
                                            <Select defaultValue="full-time">
                                                <SelectTrigger id="employment">
                                                    <SelectValue placeholder="Select employment status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full-time">Full-time</SelectItem>
                                                    <SelectItem value="part-time">Part-time</SelectItem>
                                                    <SelectItem value="self-employed">Self-employed</SelectItem>
                                                    <SelectItem value="unemployed">Unemployed</SelectItem>
                                                    <SelectItem value="retired">Retired</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employer">Employer Name</Label>
                                            <Input id="employer" placeholder="Enter your employer's name" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="job-title">Job Title</Label>
                                                <Input id="job-title" placeholder="Enter your job title" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="years-employed">Years at Current Employer</Label>
                                                <Input id="years-employed" type="number" placeholder="Years" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="annual-income">Annual Income</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5">$</span>
                                                <Input id="annual-income" className="pl-7" placeholder="Enter your annual income" />
                                            </div>
                                        </div>

                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Required Documentation</AlertTitle>
                                            <AlertDescription>
                                                You will need to provide proof of income (recent pay stubs, tax returns) and a valid ID during the final verification process.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Review & Submit</h3>

                                        <Card className="bg-muted/50">
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="text-sm">
                                                            <div className="text-muted-foreground">Loan Type</div>
                                                            <div className="font-medium">Personal Loan</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="text-muted-foreground">Loan Amount</div>
                                                            <div className="font-medium">${loanAmount.toLocaleString()}</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="text-muted-foreground">Loan Term</div>
                                                            <div className="font-medium">{loanTerm} months</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="text-muted-foreground">Interest Rate</div>
                                                            <div className="font-medium">5.25% APR</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="text-muted-foreground">Est. Monthly Payment</div>
                                                            <div className="font-medium">${monthlyPayment.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-4">
                                            <div className="flex items-top space-x-2">
                                                <Checkbox id="terms" />
                                                <Label htmlFor="terms" className="text-sm leading-tight">
                                                    I agree to the terms and conditions, privacy policy, and consent to credit check.
                                                </Label>
                                            </div>

                                            <div className="flex items-top space-x-2">
                                                <Checkbox id="communications" />
                                                <Label htmlFor="communications" className="text-sm leading-tight">
                                                    I agree to receive communications about my application and loan status.
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            {step > 1 ? (
                                <Button variant="outline" onClick={prevStep}>
                                    Previous
                                </Button>
                            ) : (
                                <Button variant="outline" asChild>
                                    <Link href="/user-app/loans">Cancel</Link>
                                </Button>
                            )}

                            {step < 4 ? (
                                <Button onClick={nextStep}>Continue</Button>
                            ) : (
                                <Button>Submit Application</Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Loan Amount</span>
                                    <span className="font-medium">${loanAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Loan Term</span>
                                    <span className="font-medium">{loanTerm} months</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Interest Rate</span>
                                    <span className="font-medium">5.25% APR</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between pt-2">
                                    <span className="font-medium">Est. Monthly Payment</span>
                                    <span className="font-bold">${monthlyPayment.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Application Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className={`rounded-full p-1 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {step > 1 ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4 text-center text-xs font-bold">1</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium">Loan Details</p>
                                        <p className="text-xs text-muted-foreground">Specify amount and terms</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`rounded-full p-1 ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {step > 2 ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4 text-center text-xs font-bold">2</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium">Personal Information</p>
                                        <p className="text-xs text-muted-foreground">Your contact details</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`rounded-full p-1 ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {step > 3 ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4 text-center text-xs font-bold">3</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium">Financial Information</p>
                                        <p className="text-xs text-muted-foreground">Income and employment</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`rounded-full p-1 ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {step > 4 ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4 text-center text-xs font-bold">4</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium">Review & Submit</p>
                                        <p className="text-xs text-muted-foreground">Finalize your application</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Our loan specialists are available to assist you with your application.
                            </p>
                            <Button variant="outline" className="w-full">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 
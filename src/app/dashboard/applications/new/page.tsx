"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle, Coins, DollarSign, Clock } from "lucide-react"
import { motion } from "framer-motion"

export default function NewApplicationPage() {
    const router = useRouter()
    const [formStep, setFormStep] = useState(1)
    const [totalSteps] = useState(3)

    const nextStep = () => {
        if (formStep < totalSteps) {
            setFormStep(formStep + 1)
        } else {
            // Submit the form
            setFormStep(totalSteps + 1) // Success screen
        }
    }

    const prevStep = () => {
        if (formStep > 1) {
            setFormStep(formStep - 1)
        } else {
            router.back()
        }
    }

    return (
        <div className="flex-1 p-6 pt-8 md:p-8 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto">
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
                        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Quick Loan Application</h2>
                        <p className="text-muted-foreground">Complete your application in just a few steps</p>
                    </div>
                </div>

                {formStep <= totalSteps && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-black dark:text-white">Progress</span>
                            <span className="text-sm text-muted-foreground">{formStep} of {totalSteps}</span>
                        </div>
                        <div className="h-2 w-full bg-yellow-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 transition-all duration-300 ease-in-out"
                                style={{ width: `${(formStep / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {formStep === 1 && (
                    <Card className="border-2 border-black dark:border-white shadow-lg overflow-hidden">
                        <div className="bg-yellow-400 p-4 text-black">
                            <h3 className="text-xl font-semibold">Personal Information</h3>
                            <p className="text-sm text-yellow-900 dark:text-yellow-950">Let's start with your basic details</p>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-black dark:text-white">First Name</Label>
                                    <Input id="firstName" placeholder="John" className="border-2 border-yellow-400 focus-visible:ring-yellow-400" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-black dark:text-white">Last Name</Label>
                                    <Input id="lastName" placeholder="Smith" className="border-2 border-yellow-400 focus-visible:ring-yellow-400" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-black dark:text-white">Email Address</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" className="border-2 border-yellow-400 focus-visible:ring-yellow-400" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-black dark:text-white">Phone Number</Label>
                                    <Input id="phone" placeholder="(123) 456-7890" className="border-2 border-yellow-400 focus-visible:ring-yellow-400" />
                                </div>
                            </div>

                            <div className="flex justify-end mt-8">
                                <Button
                                    onClick={nextStep}
                                    className="bg-yellow-400 hover:bg-gray-400 text-black hover:text-black dark:text-white px-6"
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {formStep === 2 && (
                    <Card className="border-2 border-black dark:border-white shadow-lg overflow-hidden">
                        <div className="bg-yellow-400 p-4 text-black">
                            <h3 className="text-xl font-semibold">Loan Details</h3>
                            <p className="text-sm text-yellow-900 dark:text-yellow-950">Tell us about your loan needs</p>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="amount" className="text-black dark:text-white">Loan Amount</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="5000"
                                            min="1000"
                                            className="pl-10 border-2 border-yellow-400 focus-visible:ring-yellow-400 text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="term" className="text-black dark:text-white">Loan Term</Label>
                                    <Select>
                                        <SelectTrigger id="term" className="border-2 border-yellow-400 focus-visible:ring-yellow-400">
                                            <SelectValue placeholder="Select term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="6">6 months</SelectItem>
                                            <SelectItem value="12">12 months</SelectItem>
                                            <SelectItem value="24">24 months</SelectItem>
                                            <SelectItem value="36">36 months</SelectItem>
                                            <SelectItem value="48">48 months</SelectItem>
                                            <SelectItem value="60">60 months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purpose" className="text-black dark:text-white">Loan Purpose</Label>
                                    <Select>
                                        <SelectTrigger id="purpose" className="border-2 border-yellow-400 focus-visible:ring-yellow-400">
                                            <SelectValue placeholder="Select purpose" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="home_improvement">Home Improvement</SelectItem>
                                            <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="medical">Medical Expenses</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="vehicle">Vehicle Purchase</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button
                                    onClick={prevStep}
                                    variant="outline"
                                    className="border-2 border-yellow-400 hover:bg-gray-400 text-black dark:text-white"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="bg-yellow-400 hover:bg-gray-400 text-black dark:text-white px-6"
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {formStep === 3 && (
                    <Card className="border-2 border-black dark:border-white shadow-lg overflow-hidden">
                        <div className="bg-yellow-400 p-4 text-black">
                            <h3 className="text-xl font-semibold">Confirm & Submit</h3>
                            <p className="text-sm text-yellow-900 dark:text-yellow-950">Review your application before submitting</p>
                        </div>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="bg-yellow-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-200 dark:border-gray-700">
                                    <h4 className="font-medium mb-2 flex items-center text-black dark:text-white">
                                        <Coins className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        Important Information
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        By submitting this application, you authorize us to verify your information and obtain your credit report.
                                        This is not a commitment to lend.
                                    </p>
                                </div>

                                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Your application will be processed within 24 hours, and you'll receive a decision via email.
                                        Interest rates start at 4.99% APR based on creditworthiness.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button
                                    onClick={prevStep}
                                    variant="outline"
                                    className="border-2 border-yellow-400 hover:bg-gray-400 text-black dark:text-white"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="bg-yellow-400 hover:bg-gray-400 text-black dark:text-white px-8 py-6 text-lg font-medium"
                                >
                                    Submit Application
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {formStep === totalSteps + 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-2 border-black dark:border-white shadow-xl bg-white dark:bg-black overflow-hidden">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <h3 className="text-3xl font-bold mb-3 text-black dark:text-white">Application Submitted!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                                    We've received your loan application and are reviewing it now.
                                    We'll be in touch soon with the next steps.
                                </p>

                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl border-2 border-yellow-200 dark:border-gray-600 mb-8 w-full max-w-md">
                                    <div className="flex items-center justify-center gap-4 mb-3">
                                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        <p className="font-medium text-black dark:text-white">Expected response time: <span className="font-bold">24 hours</span></p>
                                    </div>
                                    <p className="font-medium text-black dark:text-white">Reference: <span className="font-bold text-lg">APP-{Math.floor(Math.random() * 10000)}</span></p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={() => router.push('/dashboard/applications')}
                                        className="bg-yellow-400 hover:bg-gray-400 text-black hover:text-black dark:text-white px-6"
                                    >
                                        View All Applications
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setFormStep(1)}
                                        className="border-2 border-yellow-400 hover:bg-gray-400 text-black dark:text-white"
                                    >
                                        Start New Application
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    )
} 
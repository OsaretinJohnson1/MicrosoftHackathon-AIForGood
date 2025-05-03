"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, ArrowLeft, Download, Calendar, Clock, AlertCircle, FileText, CheckCircle, DollarSign, Briefcase, Building, CreditCard, User, Building2, BadgePercent, CalendarDays, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

// Type definitions
interface LoanApplication {
    application: {
        id: number
        userId: number
        loanAmount: string
        loanTermMonths: number
        interestRate: string
        purpose: string
        status: string
        applicationDate: string
        totalPayable: string
        monthlyPayment: string
        loanTypeId: number
        employer: string
        employmentType: string
        workAddress: string
        accountNumber: string
        accountName: string
        accountType: string
        bankName: string
        payDate: string
        paymentSchedule: string
        approvedDate: string | null
        rejectionReason: string | null
        isDisbursed: number
        disbursementDate: string | null
        isOverdue: number
        overdueAmount: string | null
        overdueDate: string | null
        documents: string | null
        notes: string | null
        nextPaymentDate: string | null
        remainingBalance: string | null
    }
    loanType: {
        id: number
        name: string
        description: string
        baseInterestRate: string
    }
}

interface Transaction {
    id: number
    transactionId: string
    amount: string
    transactionType: string
    status: string
    transactionDate: string
    paymentMethod: string | null
    reference: string | null
    description: string | null
}

interface UserData {
    firstname: string
    lastname: string
    phone: string
    email: string
}

interface LoanDetails {
    applicationData: LoanApplication
    transactions: Transaction[]
    user: UserData
}

interface RelatedApplication {
    id: number
    type: string
    amount: string
    date: string
    status: string
    loanTypeId: number
}

export default function LoanDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null)
    const [relatedApplications, setRelatedApplications] = useState<RelatedApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch loan details
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchLoanDetails()
            fetchRelatedApplications()
        } else if (status === "unauthenticated") {
            router.push("/auth/login")
        }
    }, [status, session, id, router])

    const fetchLoanDetails = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/crud-users/read-user-application?id=${id}`)
            const data = await response.json()

            if (data.success) {
                setLoanDetails(data.data)
            } else {
                setError(data.message || "Failed to load loan details")
            }
        } catch (err) {
            console.error("Error fetching loan details:", err)
            setError("An error occurred while fetching the loan details")
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedApplications = async () => {
        try {
            if (!session?.user?.id) return

            const response = await fetch(`/api/crud-users/read-user-applications?userId=${session.user.id}&page=1&limit=5`)
            const data = await response.json()

            if (data.success && data.data.applications) {
                // Filter out the current application
                const otherApplications = data.data.applications.filter(
                    (app: any) => app.id !== parseInt(id as string)
                ).map((app: any) => ({
                    id: app.id,
                    type: app.loanType?.name || "Loan",
                    amount: app.loanAmount,
                    date: app.applicationDate,
                    status: app.status,
                    loanTypeId: app.loanTypeId
                }))

                setRelatedApplications(otherApplications)
            }
        } catch (err) {
            console.error("Error fetching related applications:", err)
        }
    }

    // Helper functions
    const formatCurrency = (amount: string | number | null) => {
        if (amount === null) return "R0.00"
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }).format(Number(amount))
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Approved</Badge>
            case "pending":
                return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Pending</Badge>
            case "processing":
                return <Badge className="bg-blue-400 text-white hover:bg-blue-500">Processing</Badge>
            case "rejected":
                return <Badge className="bg-rose-500 text-white hover:bg-rose-600">Rejected</Badge>
            case "disbursed":
                return <Badge className="bg-sky-500 text-white hover:bg-sky-600">Disbursed</Badge>
            case "completed":
                return <Badge className="bg-emerald-700 text-white hover:bg-emerald-800">Completed</Badge>
            case "defaulted":
                return <Badge className="bg-rose-700 text-white hover:bg-rose-800">Defaulted</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    // Calculate loan progress
    const calculateProgress = (): number => {
        if (!loanDetails?.applicationData.application) return 0

        const { application } = loanDetails.applicationData

        // For loans not yet disbursed
        if (application.status.toLowerCase() === "pending") return 0
        if (application.status.toLowerCase() === "processing") return 0
        if (application.status.toLowerCase() === "rejected") return 0

        // If loan has been fully repaid
        if (application.status.toLowerCase() === "completed") return 100

        // Calculate progress based on remaining balance vs total payable
        if (application.remainingBalance && application.totalPayable) {
            const remaining = parseFloat(application.remainingBalance)
            const total = parseFloat(application.totalPayable)

            if (total <= 0) return 0

            const progress = ((total - remaining) / total) * 100
            return Math.min(Math.max(progress, 0), 100) // Ensure between 0-100
        }

        // Default to 0 if we can't calculate
        return 0
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary mb-6" />
                    <p className="text-xl text-muted-foreground">Loading your loan details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container max-w-5xl mx-auto p-6">
                <Button
                    variant="outline"
                    className="mb-8 group hover:bg-muted/50 transition-all duration-200"
                    onClick={() => router.push("/user-app/loans")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Loans
                </Button>

                <Alert variant="destructive" className="animate-fadeIn">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-medium">Error</AlertTitle>
                    <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!loanDetails) {
        return (
            <div className="container max-w-5xl mx-auto p-6">
                <Button
                    variant="outline"
                    className="mb-8 group hover:bg-muted/50 transition-all duration-200"
                    onClick={() => router.push("/user-app/loans")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Loans
                </Button>

                <Alert className="animate-fadeIn bg-muted/40">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-medium">Loan Not Found</AlertTitle>
                    <AlertDescription className="text-base">
                        The loan application you're looking for doesn't exist or you don't have permission to view it.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Destructure data for easier access
    const { application } = loanDetails.applicationData
    const { loanType } = loanDetails.applicationData
    const { transactions } = loanDetails
    const { user } = loanDetails

    // Calculate progress
    const progress = calculateProgress()

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        }
    }

    // Get status style class for the header based on status
    const getStatusHeaderClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "border-t-emerald-500 from-emerald-50/30 to-transparent dark:from-emerald-900/10"
            case "pending":
                return "border-t-amber-500 from-amber-50/30 to-transparent dark:from-amber-900/10"
            case "processing":
                return "border-t-blue-400 from-blue-50/30 to-transparent dark:from-blue-900/10"
            case "rejected":
                return "border-t-rose-500 from-rose-50/30 to-transparent dark:from-rose-900/10"
            case "disbursed":
                return "border-t-sky-500 from-sky-50/30 to-transparent dark:from-sky-900/10"
            case "completed":
                return "border-t-emerald-700 from-emerald-50/30 to-transparent dark:from-emerald-900/10"
            case "defaulted":
                return "border-t-rose-700 from-rose-50/30 to-transparent dark:from-rose-900/10"
            default:
                return "border-t-primary from-primary-50/30 to-transparent dark:from-primary-900/10"
        }
    }

    return (
        <motion.div
            className="container max-w-5xl mx-auto p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="outline"
                    className="group hover:bg-muted/50 transition-all duration-200"
                    onClick={() => router.push("/user-app/loans")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Loans
                </Button>

                {(application.status.toLowerCase() === "approved" ||
                    application.status.toLowerCase() === "disbursed") && (
                        <Button
                            variant="outline"
                            className="group hover:bg-muted/50 transition-all duration-200"
                            onClick={async () => {
                                try {
                                    const response = await fetch(`/api/loans/download-agreement?id=${application.id}`, {
                                        method: 'GET',
                                    });

                                    if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `loan-agreement-${application.id}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    } else {
                                        console.error('Failed to download agreement');
                                        // Could add toast notification here
                                    }
                                } catch (error) {
                                    console.error('Error downloading agreement:', error);
                                    // Could add toast notification here
                                }
                            }}
                        >
                            <Download className="h-4 w-4 mr-2 group-hover:translate-y-1 transition-transform duration-200" />
                            Download Agreement
                        </Button>
                    )}

                <div className="ml-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-muted/80 transition-all duration-200"
                        title="Get Help"
                        onClick={() => router.push(`/user-app/support?loanId=${application.id}`)}
                    >
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                variants={itemVariants}
            >
                {/* Main Loan Details Card */}
                <Card className="lg:col-span-2 overflow-hidden group border-t-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl relative"
                    style={{
                        borderTopColor: `var(--${application.status.toLowerCase() === "approved" ? "emerald" :
                            application.status.toLowerCase() === "pending" ? "amber" :
                                application.status.toLowerCase() === "rejected" ? "rose" :
                                    application.status.toLowerCase() === "completed" ? "emerald" :
                                        application.status.toLowerCase() === "disbursed" ? "sky" : "muted"})`
                    }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-b ${getStatusHeaderClass(application.status)} pointer-events-none opacity-90`}></div>

                    <CardHeader className="pb-3 relative">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight">{loanType.name} Application</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    Application #{application.id} • Submitted on {formatDate(application.applicationDate)}
                                </CardDescription>
                            </div>
                            <div className="md:text-right">
                                {getStatusBadge(application.status)}
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ref: LOAN-{application.id.toString().padStart(5, '0')}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative">
                        <div className="space-y-8">
                            {/* Amount and Term */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div className="bg-muted/30 rounded-lg p-4 shadow-sm transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                                    <div className="flex items-start">
                                        <div className="rounded-full bg-primary/10 p-2 mr-3">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                                            <p className="text-2xl font-bold tracking-tight">{formatCurrency(application.loanAmount)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 shadow-sm transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                                    <div className="flex items-start">
                                        <div className="rounded-full bg-primary/10 p-2 mr-3">
                                            <CalendarDays className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Loan Term</p>
                                            <p className="text-2xl font-bold tracking-tight">{application.loanTermMonths} months</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="bg-muted/20 rounded-lg p-4 shadow-sm">
                                <div className="flex items-start mb-2">
                                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Loan Purpose</p>
                                        <p className="text-lg font-medium">{application.purpose || "Not specified"}</p>
                                    </div>
                                </div>
                                {loanType.description && (
                                    <p className="text-sm text-muted-foreground mt-2 ml-12">
                                        {loanType.description}
                                    </p>
                                )}
                            </div>

                            {/* Status Timeline */}
                            <div className="space-y-2 p-4 bg-muted/10 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Application Timeline</h3>

                                <div className="space-y-0">
                                    {/* Step 1: Submitted */}
                                    <div className="flex items-start gap-3 pb-8 relative">
                                        <div className="absolute left-4 top-8 h-full w-0.5 bg-muted-foreground/30"></div>
                                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 z-10">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="ml-2">
                                            <p className="font-semibold text-base">Application Submitted</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(application.applicationDate)}</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Review Result */}
                                    {application.status.toLowerCase() !== "pending" && (
                                        <div className="flex items-start gap-3 pb-8 relative">
                                            {application.isDisbursed === 1 && (
                                                <div className="absolute left-4 top-8 h-full w-0.5 bg-muted-foreground/30"></div>
                                            )}
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 z-10 ${application.status.toLowerCase() === "approved" ||
                                                    application.status.toLowerCase() === "disbursed" ||
                                                    application.status.toLowerCase() === "completed"
                                                    ? "bg-emerald-500"
                                                    : "bg-rose-500"
                                                }`}>
                                                {application.status.toLowerCase() === "rejected" ? (
                                                    <AlertCircle className="h-5 w-5 text-white" />
                                                ) : (
                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                )}
                                            </div>
                                            <div className="ml-2">
                                                <p className="font-semibold text-base">
                                                    {application.status.toLowerCase() === "rejected"
                                                        ? "Application Rejected"
                                                        : "Application Approved"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(application.approvedDate)}
                                                </p>
                                                {application.status.toLowerCase() === "rejected" && application.rejectionReason && (
                                                    <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-300">
                                                        {application.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Disbursement */}
                                    {application.isDisbursed === 1 && (
                                        <div className="flex items-start gap-3 pb-8 relative">
                                            {application.status.toLowerCase() === "completed" && (
                                                <div className="absolute left-4 top-8 h-full w-0.5 bg-muted-foreground/30"></div>
                                            )}
                                            <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center mt-0.5 z-10">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="ml-2">
                                                <p className="font-semibold text-base">Funds Disbursed</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(application.disbursementDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Completed */}
                                    {application.status.toLowerCase() === "completed" && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center mt-0.5 z-10">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="ml-2">
                                                <p className="font-semibold text-base">Loan Fully Repaid</p>
                                                <p className="text-sm text-muted-foreground">Congratulations on completing your loan repayment!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details - only show if approved or disbursed */}
                            {(application.status.toLowerCase() === "approved" ||
                                application.status.toLowerCase() === "disbursed" ||
                                application.status.toLowerCase() === "completed") && (
                                    <>
                                        <div className="bg-muted/30 p-5 rounded-lg border border-muted shadow-sm">
                                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                                                Payment Details
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-background/80 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                                                    <div className="flex items-center">
                                                        <BadgePercent className="h-4 w-4 mr-1 text-primary" />
                                                        <p className="text-xl font-semibold">{application.interestRate}%</p>
                                                    </div>
                                                </div>
                                                <div className="bg-background/80 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                                                    <p className="text-xl font-semibold">{formatCurrency(application.monthlyPayment)}</p>
                                                </div>
                                                <div className="bg-background/80 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-muted-foreground">Total Payable</p>
                                                    <p className="text-xl font-semibold">{formatCurrency(application.totalPayable)}</p>
                                                </div>
                                            </div>

                                            {application.status.toLowerCase() === "disbursed" && (
                                                <div className="mt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-background/80 p-3 rounded-lg">
                                                            <p className="text-sm font-medium text-muted-foreground">Next Payment Date</p>
                                                            <p className="text-lg font-semibold flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1 text-primary" />
                                                                {formatDate(application.nextPaymentDate)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-background/80 p-3 rounded-lg">
                                                            <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                                                            <p className="text-lg font-semibold">{formatCurrency(application.remainingBalance)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 bg-background/60 p-3 rounded-lg">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-sm font-medium">Repayment Progress</span>
                                                            <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="relative">
                                                            <Progress value={progress} className="h-2.5 rounded-full" />
                                                            <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                                                                <span>0%</span>
                                                                <span>100%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Supporting Information */}
                <motion.div
                    className="space-y-6"
                    variants={itemVariants}
                >
                    <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-2 border-t-muted-foreground/30">
                        <CardHeader className="pb-2 bg-muted/30">
                            <CardTitle className="text-lg font-semibold flex items-center">
                                <User className="h-5 w-5 mr-2 text-primary" />
                                Application Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Applicant Information</h4>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                    <p className="font-medium text-base">{user.firstname} {user.lastname}</p>
                                    <p className="text-sm mt-1 flex items-center">
                                        <span className="inline-flex w-14 text-muted-foreground">Email:</span>
                                        {user.email}
                                    </p>
                                    <p className="text-sm mt-1 flex items-center">
                                        <span className="inline-flex w-14 text-muted-foreground">Phone:</span>
                                        {user.phone}
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-1" />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Employment Details</h4>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                    <p className="font-medium text-base">{application.employer}</p>
                                    <p className="text-sm mt-1">
                                        <span className="text-muted-foreground">Type:</span> {application.employmentType}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="text-muted-foreground">Address:</span> {application.workAddress}
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-1" />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Banking Information</h4>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                    <p className="font-medium text-base">{application.bankName}</p>
                                    <p className="text-sm mt-1">
                                        <span className="text-muted-foreground">Account:</span> {application.accountName}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="text-muted-foreground">Type:</span> {application.accountType}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="text-muted-foreground">Number:</span> •••• {application.accountNumber.slice(-4)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {transactions && transactions.length > 0 ? (
                        <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-2 border-t-primary">
                            <CardHeader className="pb-2 bg-primary/10">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                                    Transaction History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {transactions.map((transaction, index) => (
                                        <motion.div
                                            key={transaction.id}
                                            className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0 hover:bg-muted/20 p-2 rounded-lg transition-colors duration-200"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (index * 0.05) }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.transactionType.toLowerCase() === "repayment"
                                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                                                    }`}>
                                                    {transaction.transactionType.toLowerCase() === "repayment" ? (
                                                        <CreditCard className="h-5 w-5" />
                                                    ) : (
                                                        <DollarSign className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{transaction.transactionType}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(transaction.transactionDate)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Ref: {transaction.transactionId}
                                                    </p>
                                                    {transaction.description && (
                                                        <p className="text-xs mt-1 text-muted-foreground">{transaction.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold text-lg ${transaction.transactionType.toLowerCase() === "repayment"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-sky-600 dark:text-sky-400"
                                                    }`}>
                                                    {transaction.transactionType.toLowerCase() === "repayment" ? "- " : "+ "}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <Badge variant="outline" className="text-xs mt-1 font-normal">
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : application.status.toLowerCase() !== "pending" && application.status.toLowerCase() !== "rejected" ? (
                        <Card className="rounded-xl shadow-md overflow-hidden border-t-2 border-t-muted-foreground/20">
                            <CardHeader className="pb-2 bg-muted/20">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                                    Transaction History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="py-8 text-center">
                                    <Clock className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                                    <p className="text-muted-foreground">No transactions yet</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Related Applications */}
                    {relatedApplications.length > 0 && (
                        <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-2 border-t-muted-foreground/30">
                            <CardHeader className="pb-2 bg-muted/30">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-primary" />
                                    Other Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {relatedApplications.slice(0, 3).map((app, index) => (
                                        <motion.div
                                            key={app.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (index * 0.05) }}
                                        >
                                            <div>
                                                <p className="font-medium">{app.type}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(app.date)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-medium">{formatCurrency(app.amount)}</p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {relatedApplications.length > 3 && (
                                        <Button
                                            variant="ghost"
                                            className="w-full text-sm mt-2"
                                            onClick={() => router.push("/user-app/applications")}
                                        >
                                            View all applications
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

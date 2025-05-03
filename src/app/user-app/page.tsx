"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    ArrowUpRight,
    Bell,
    Calendar,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    HelpCircle,
    Info,
    Loader2,
    Wallet,
    AlertCircle,
    User
} from "lucide-react"

// Types for our data
interface UserData {
    id: number
    firstname: string
    lastname: string
    email: string
    phone: string
}

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
        isDisbursed: number
        nextPaymentDate: string | null
        remainingBalance: string | null
    }
    loanType: {
        name: string
        description: string
    }
}

interface Transaction {
    id: number
    transactionId: string
    amount: string
    transactionType: string
    status: string
    transactionDate: string
    description: string | null
}

export default function UserDashboardPage() {
    const { data: session, status: sessionStatus } = useSession()
    const router = useRouter()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [applications, setApplications] = useState<LoanApplication[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalBalance, setTotalBalance] = useState(0)
    const [accountNumber, setAccountNumber] = useState("")
    const [nextPayment, setNextPayment] = useState<{ amount: string; date: string | null } | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<string>("good")
    const [eligibility, setEligibility] = useState<number>(0)
    const [availableCredit, setAvailableCredit] = useState(0)
    const [maxCreditLimit, setMaxCreditLimit] = useState(20000) // Default value that will be updated

    // Fetch user data when the component mounts
    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user?.id) {
            fetchUserData()
            fetchApplications()
            fetchTransactions()
        } else if (sessionStatus === "unauthenticated") {
            router.push("/auth/login")
        }
    }, [sessionStatus, session, router])

    const fetchUserData = async () => {
        try {
            // Use the user endpoint which automatically uses the session ID
            const response = await fetch(`/api/crud-users/user`)
            const data = await response.json()

            if (data.success && data.data) {
                setUserData(data.data)
                // Generate account number based on user ID
                setAccountNumber(`Account-${data.data.id.toString().padStart(5, '0')}`)
            } else {
                console.error("Failed to fetch user data:", data.message)
            }
        } catch (err) {
            console.error("Error fetching user data:", err)
        }
    }

    const fetchApplications = async () => {
        try {
            const response = await fetch(`/api/crud-users/read-user-applications?page=1&limit=10`)
            const data = await response.json()

            console.log("API response for applications:", data); // Debug logging

            if (data.success && Array.isArray(data.data)) {
                setApplications(data.data)

                // Calculate total balance from active loans
                let total = 0
                let nextPaymentFound = false
                let closestPaymentDate: Date | null = null
                let closestPaymentAmount = "0"

                data.data.forEach((app: LoanApplication) => {
                    if (app.application.isDisbursed === 1 &&
                        (app.application.status.toLowerCase() === "disbursed" ||
                            app.application.status.toLowerCase() === "approved")) {
                        total += parseFloat(app.application.remainingBalance || app.application.loanAmount)

                        // Find the next payment date across all loans
                        if (app.application.nextPaymentDate) {
                            const paymentDate = new Date(app.application.nextPaymentDate)

                            // Only consider future dates
                            if (paymentDate > new Date()) {
                                if (!closestPaymentDate || paymentDate < closestPaymentDate) {
                                    closestPaymentDate = paymentDate
                                    closestPaymentAmount = app.application.monthlyPayment || "0"
                                    nextPaymentFound = true
                                }
                            }
                        }
                    }
                })

                setTotalBalance(total)

                // Set next payment information
                if (nextPaymentFound && closestPaymentDate) {
                    setNextPayment({
                        amount: closestPaymentAmount,
                        date: (closestPaymentDate as Date).toISOString()
                    })
                }

                // Calculate available credit using the max credit limit from the database
                setAvailableCredit(maxCreditLimit - total > 0 ? maxCreditLimit - total : 0);

                // Set eligibility based on loan history - simple example logic
                const activeLoans = getActiveLoans(data.data);
                if (activeLoans.length <= 1 && total < maxCreditLimit / 2) {
                    setEligibility(85) // Higher eligibility for users with fewer/smaller loans
                } else if (activeLoans.length <= 2 && total < maxCreditLimit * 0.75) {
                    setEligibility(65) // Medium eligibility
                } else {
                    setEligibility(35) // Lower eligibility for users with many/large loans
                }
            } else {
                console.error("Failed to fetch applications:", data.message)
            }
        } catch (err) {
            console.error("Error fetching applications:", err)
        }
    }

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`/api/crud-users/read`)
            const data = await response.json()

            if (data.success && data.data && Array.isArray(data.data.transactions)) {
                setTransactions(data.data.transactions)
            } else {
                console.error("Failed to fetch transactions:", data.message)
            }
        } catch (err) {
            console.error("Error fetching transactions:", err)
        } finally {
            setLoading(false)
        }
    }

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    // Format currency for display
    const formatCurrency = (amount: string | number | null) => {
        if (amount === null) return "R0.00"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }).format(Number(amount))
    }

    // Calculate loan progress based on remaining balance vs total payable
    const calculateProgress = (application: LoanApplication["application"]): number => {
        if (application.status.toLowerCase() === "pending" ||
            application.status.toLowerCase() === "processing" ||
            application.isDisbursed === 0) return 0
        if (application.status.toLowerCase() === "completed") return 100

        if (application.remainingBalance && application.totalPayable) {
            const remaining = parseFloat(application.remainingBalance)
            const total = parseFloat(application.totalPayable)

            if (total <= 0) return 0

            const progress = ((total - remaining) / total) * 100
            return Math.min(Math.max(progress, 0), 100) // Ensure between 0-100
        }

        return 50 // Default to 50% if we can't calculate
    }

    // Get active and disbursed loans
    const getActiveLoans = (apps: LoanApplication[]) => {
        // Show all loans that are not rejected, cancelled, pending or processing
        return apps.filter(app =>
            app.application.status.toLowerCase() !== "rejected" &&
            app.application.status.toLowerCase() !== "cancelled" &&
            app.application.status.toLowerCase() !== "pending" &&
            app.application.status.toLowerCase() !== "processing"
        );
    }

    const activeLoans = getActiveLoans(applications);

    // Log all loans and their statuses for debugging
    console.log('All loans and their statuses:', applications.map(app => ({
        id: app.application.id,
        status: app.application.status,
        isDisbursed: app.application.isDisbursed,
        type: app.loanType.name
    })));

    // Get all applications except those that are already active loans
    const allApplications = applications // Show all applications without filtering

    // Add debug logging
    console.log('All applications:', applications);

    if (loading && sessionStatus !== "loading") {
        return (
            <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 p-6 pt-8 md:p-8">
                <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Refresh Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userData?.firstname || ""}</h2>
                    <p className="text-muted-foreground">Here's an overview of your loans and account</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                        <Link href="/user-app/support">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Get Help
                        </Link>
                    </Button>
                    <Button size="sm" className="rounded-full" asChild>
                        <Link href="/user-app/payments">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Make a Payment
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="stats-card relative card-hover overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                        <p className="text-xs text-muted-foreground">Across {activeLoans.length} active loans</p>
                    </CardContent>
                </Card>

                <Card className="stats-card relative card-hover overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                            <Calendar className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {nextPayment ? (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(nextPayment.amount)}</div>
                                <p className="text-xs text-muted-foreground">Due on {formatDate(nextPayment.date)}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-muted-foreground">No upcoming payments</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="stats-card relative card-hover overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Number</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <CreditCard className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{accountNumber}</div>
                        <p className="text-xs text-muted-foreground">Reference for payments</p>
                    </CardContent>
                </Card>
            </div>

            {nextPayment && new Date(nextPayment.date as string) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-800">
                    <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                            <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                                <CardTitle>Upcoming Payment Reminder</CardTitle>
                                <CardDescription>
                                    You have a payment of {formatCurrency(nextPayment.amount)} due on {formatDate(nextPayment.date)}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/user-app/payments">Make Payment</Link>
                            </Button>
                            <Button size="sm" variant="ghost">Remind Me Later</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="loans" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    {/* <TabsTrigger value="loans" className="rounded-md">
            My Loans
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-md">
            Transactions
          </TabsTrigger> */}
                    <TabsTrigger value="applications" className="rounded-md">
                        Applications
                    </TabsTrigger>
                    {/* <TabsTrigger value="notifications" className="rounded-md">
            Notifications
          </TabsTrigger> */}
                </TabsList>

                <TabsContent value="loans" className="space-y-6">
                    {/* <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {activeLoans.length > 0 ? (
              activeLoans.map((loan) => (
                <Card key={loan.application.id} className="card-hover">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{loan.loanType.name}</CardTitle>
                      <Badge variant={loan.application.status.toLowerCase() === "disbursed" ? "default" : "outline"} className="rounded-full">
                        {loan.application.status}
                      </Badge>
                    </div>
                    <CardDescription>Loan ID: LOAN-{loan.application.id.toString().padStart(3, '0')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Original Amount</p>
                        <p className="text-lg font-semibold">{formatCurrency(loan.application.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-lg font-semibold">{formatCurrency(loan.application.remainingBalance || loan.application.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="text-lg font-semibold">{loan.application.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Term</p>
                        <p className="text-lg font-semibold">{loan.application.loanTermMonths} months</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Repayment Progress</span>
                        <span className="font-medium">{calculateProgress(loan.application).toFixed(0)}%</span>
                      </div>
                      <Progress value={calculateProgress(loan.application)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="font-medium">{formatDate(loan.application.nextPaymentDate)}</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/user-app/loans/${loan.application.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>No Active Loans</CardTitle>
                  <CardDescription>You don't have any active loans at the moment</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Need financing?</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Apply for a new loan to meet your financial needs.
                  </p>
                  <Button asChild>
                    <Link href="/user-app/applications">Start New Application</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div> */}

                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle>Need Additional Financing?</CardTitle>
                            <CardDescription>Check your eligibility for additional loans or credit increases</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border p-4 text-center">
                                    <DollarSign className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-medium">Personal Loan</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Borrow up to $25,000</p>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/user-app/applications?type=personal">Apply Now</Link>
                                    </Button>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <CreditCard className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-medium">Credit Line Increase</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Increase your available credit</p>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/user-app/applications?type=increase">Request Increase</Link>
                                    </Button>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <Wallet className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-medium">Debt Consolidation</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Combine multiple debts</p>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/user-app/applications?type=consolidation">Learn More</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6">
                    <Card className="card-hover">
                        <CardHeader className="pb-3">
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>View your recent payment history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transactions.length > 0 ? (
                                    transactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.transactionType.toLowerCase() === "repayment"
                                                            ? "bg-emerald-100 text-emerald-600"
                                                            : "bg-amber-100 text-amber-600"
                                                        }`}
                                                >
                                                    {transaction.transactionType.toLowerCase() === "repayment" ? (
                                                        <DollarSign className="h-5 w-5" />
                                                    ) : (
                                                        <Info className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{transaction.transactionType}</p>
                                                    <p className="text-sm text-muted-foreground">{formatDate(transaction.transactionDate)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`font-semibold ${transaction.transactionType.toLowerCase() === "repayment" ? "text-emerald-600" : "text-amber-600"
                                                        }`}
                                                >
                                                    {transaction.transactionType.toLowerCase() === "repayment" ? "-" : "+"}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                                    <Link href={`/user-app/transactions/${transaction.id}`}>View</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full py-10">
                                        <p className="text-muted-foreground">No transactions found</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex justify-center">
                                <Button variant="outline" asChild>
                                    <Link href="/user-app/transactions">
                                        View All Transactions
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-hover">
                        <CardHeader className="pb-3">
                            <CardTitle>Statements</CardTitle>
                            <CardDescription>Access your monthly account statements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {["April 2023", "March 2023", "February 2023", "January 2023"].map((month, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{month} Statement</p>
                                                <p className="text-sm text-muted-foreground">Generated on 1st of {month.split(" ")[0]}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications" className="space-y-6">
                    {applications && applications.length > 0 ? (
                        <Card className="card-hover">
                            <CardHeader className="pb-3">
                                <CardTitle>Loan Applications</CardTitle>
                                <CardDescription>Track the status of your loan applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {applications.map((application) => (
                                        <div key={application.application.id} className="rounded-lg border p-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold">{application.loanType.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Application ID: APP-{application.application.id}</p>
                                                    <p className="text-sm text-muted-foreground">Submitted on {formatDate(application.application.applicationDate)}</p>
                                                    <p className="text-sm font-medium mt-1">Status: {application.application.status}</p>
                                                </div>
                                                <div className="flex flex-col items-start md:items-end gap-2">
                                                    <Badge
                                                        variant={application.application.status.toLowerCase() === "approved" ? "default" : "outline"}
                                                        className="rounded-full"
                                                    >
                                                        {application.application.status}
                                                    </Badge>
                                                    <p className="font-medium">{formatCurrency(application.application.loanAmount)}</p>
                                                    <Button size="sm" asChild>
                                                        <Link href={`/user-app/loans/${application.application.id}`}>View Application</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="card-hover">
                            <CardHeader className="pb-3">
                                <CardTitle>No Applications</CardTitle>
                                <CardDescription>You don't have any loan applications at the moment</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Need a new loan?</h3>
                                <p className="text-center text-muted-foreground mb-6 max-w-md">
                                    Apply for a new loan or credit line increase to meet your financial needs.
                                </p>
                                <Button asChild>
                                    <Link href="/user-app/applications">Start New Application</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="card-hover">
                        <CardHeader className="pb-3">
                            <CardTitle>Application Process</CardTitle>
                            <CardDescription>Understanding the loan application journey</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                {[
                                    {
                                        step: "1",
                                        title: "Application",
                                        description: "Fill out and submit your loan application",
                                    },
                                    {
                                        step: "2",
                                        title: "Review",
                                        description: "Our team reviews your application and documents",
                                    },
                                    {
                                        step: "3",
                                        title: "Approval",
                                        description: "Receive a decision on your loan application",
                                    },
                                    {
                                        step: "4",
                                        title: "Funding",
                                        description: "Approved funds are disbursed to your account",
                                    },
                                ].map((step, i) => (
                                    <div key={i} className="rounded-lg border p-4 text-center">
                                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            {step.step}
                                        </div>
                                        <h3 className="mb-1 font-medium">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="card-hover">
                        <CardHeader className="pb-3">
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Stay updated with important information about your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="py-10 text-center">
                                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No notifications at this time</p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <Button variant="outline" asChild>
                                    <Link href="/user-app/notifications">
                                        View All Notifications
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-hover">
                        <CardHeader className="pb-3">
                            <CardTitle>Communication Preferences</CardTitle>
                            <CardDescription>Manage how you receive notifications and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/user-app/settings/notifications">
                                        <Bell className="mr-2 h-4 w-4" />
                                        Notification Settings
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

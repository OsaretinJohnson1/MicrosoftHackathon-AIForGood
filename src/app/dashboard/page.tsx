"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, TrendingUp, Users, CreditCard, BarChart3, XCircle, Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { DashboardData, RecentApplication, LoanTypeDistribution, StatusDistribution } from "@/interfaces/dashboard"

// Custom AnimatedCard component with Framer Motion
const AnimatedCard = ({ children, index, className }: {
    children: React.ReactNode;
    index: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Animated counter for numbers
const Counter = ({ value, duration = 2 }: {
    value: string | number;
    duration?: number;
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value.toString().replace(/,/g, ''));
        const incrementTime = (duration * 1000) / end;

        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{typeof value === 'string' && value.includes(',') ? count.toLocaleString() : count}</>;
};

// Theme switcher component
const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border hover:bg-accent transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
};

export default function DashboardPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        metrics: {
            totalLoansAmount: '0',
            totalLoansCount: 0,
            activeLoansCount: 0,
            activeLoansAmount: '0',
            pendingApplicationsCount: 0,
            rejectedLoansCount: 0
        },
        loanTypeDistribution: [],
        statusDistribution: [],
        recentApplications: [],
        monthlyPerformance: []
    });
    const [error, setError] = useState('');

    // Primary brand color and its variations
    const brandColor = "#a8a832";

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/dashboard');
                setDashboardData(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Function to handle viewing application details
    const handleViewApplication = (applicationId: string) => {
        router.push(`/dashboard/applications/${applicationId}`);
    };

    // Format amount from string to display format
    const formatAmount = (amount: string | number) => {
        if (!amount) return "R0";
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        console.log(numAmount);
        return `R${numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const formatRandAmount = (amount: string) => {
        // Remove currency symbols and non-numeric characters
        const numericValue = Number(amount.toString().replace(/[^0-9.-]+/g, ''));
        // Format with R prefix
        return `R${numericValue.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`;
      };

    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // If data is loading, show loading state
    if (isLoading) {
        return (
            <div className="flex-1 space-y-6 p-6 pt-8 md:p-8 bg-gradient-to-br from-background to-accent/20 min-h-screen">
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <DollarSign className="h-10 w-10 mx-auto mb-4 animate-pulse text-primary" />
                        <p className="text-xl">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If there's an error, show error state
    if (error) {
        return (
            <div className="flex-1 space-y-6 p-6 pt-8 md:p-8 bg-gradient-to-br from-background to-accent/20 min-h-screen">
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <XCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                        <p className="text-xl text-red-500">{error}</p>
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 space-y-6 p-6 pt-8 md:p-8 bg-gradient-to-br from-background to-accent/20 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground">Here's an overview of your loan business</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">Last updated: {currentDate}</p>
                        <ThemeSwitcher />
                    </div>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <AnimatedCard index={0} className="relative overflow-hidden border-2 border-border rounded-xl bg-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatAmount(dashboardData.metrics.totalLoansAmount)}</div>
                            
                            <div className="flex items-center pt-1">
                                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                                <p className="text-xs text-emerald-500 font-medium">+20.1% from last month</p>
                            </div>
                        </CardContent>
                    </AnimatedCard>

                    <AnimatedCard index={1} className="relative overflow-hidden border-2 border-border rounded-xl bg-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 dark:bg-emerald-500/10">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{dashboardData.metrics.activeLoansCount}</div>
                            <div className="flex items-center pt-1">
                                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                                <p className="text-xs text-emerald-500 font-medium">+10.5% from last month</p>
                            </div>
                        </CardContent>
                    </AnimatedCard>

                    <AnimatedCard index={2} className="relative overflow-hidden border-2 border-border rounded-xl bg-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 dark:bg-amber-500/10">
                                <Clock className="h-4 w-4 text-amber-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{dashboardData.metrics.pendingApplicationsCount}</div>
                            <div className="flex items-center pt-1">
                                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                                <p className="text-xs text-emerald-500 font-medium">+12.3% from last month</p>
                            </div>
                        </CardContent>
                    </AnimatedCard>

                    <AnimatedCard index={3} className="relative overflow-hidden border-2 border-border rounded-xl bg-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected Loans</CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/10">
                                <XCircle className="h-4 w-4 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{dashboardData.metrics.rejectedLoansCount}</div>
                            <div className="flex items-center pt-1">
                                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                                <p className="text-xs text-emerald-500 font-medium">+8.2% from last month</p>
                            </div>
                        </CardContent>
                    </AnimatedCard>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Tabs defaultValue="overview" className="space-y-6">
                        {/* <TabsList className="bg-muted/50 p-1 rounded-lg">
                            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Reports
                            </TabsTrigger>
                        </TabsList> */}

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                                {/* <AnimatedCard index={0} className="col-span-4 border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <CardTitle>Loan Performance</CardTitle>
                                        <CardDescription>Monthly loan disbursement and repayment trends</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="h-[300px] w-full rounded-md bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-muted-foreground"
                                        >
                                            <div className="text-center">
                                                <DollarSign className="h-10 w-10 mx-auto mb-2 text-primary" />
                                                <p>Loan Performance Chart</p>
                                                {dashboardData.monthlyPerformance.length > 0 ? (
                                                    <p className="text-sm mt-2">Data available for {dashboardData.monthlyPerformance.length} months</p>
                                                ) : (
                                                    <p className="text-sm mt-2">No performance data available yet</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </AnimatedCard> */}

                                <Card className="col-span-3 border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <CardTitle>Recent Applications</CardTitle>
                                        <CardDescription>Latest loan applications received</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {dashboardData.recentApplications.length > 0 ? (
                                                dashboardData.recentApplications.map((app: RecentApplication, i: number) => (
                                                    <motion.div
                                                        key={app.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: i * 0.1 }}
                                                        whileHover={{ x: 5 }}
                                                        className="flex items-center gap-4 group cursor-pointer"
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                                                            ${app.status === "approved"
                                                                ? "bg-emerald-500"
                                                                : app.status === "rejected"
                                                                    ? "bg-red-500"
                                                                    : "bg-primary"}`}
                                                        >
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                                {app.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                 {/* {`R${Number(app.amount.replace(/[^0-9.-]+/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • ${app.term}`} */}
                                                                 {formatRandAmount(app.amount)} • {app.term}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-primary/10 hover:text-primary transition-colors"
                                                                onClick={() => handleViewApplication(app.id)}
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-muted-foreground">No recent applications found</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            {/* </div> */}

                            {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> */}
                                {/* <Card className="border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader className="pb-2">
                                        <CardTitle>Quick Actions</CardTitle>
                                        <CardDescription>Common tasks you can perform</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { title: "New Loan", icon: DollarSign, color: "bg-primary/10 text-primary" },
                                                { title: "Add Customer", icon: Users, color: "bg-blue-500/10 text-blue-500 dark:text-blue-400" },
                                                { title: "Process Payment", icon: CreditCard, color: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" },
                                                { title: "Generate Report", icon: BarChart3, color: "bg-amber-500/10 text-amber-500 dark:text-amber-400" },
                                            ].map((action, i) => (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex flex-col items-center justify-center rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                                                    onClick={() => alert(`${action.title} action clicked`)}
                                                >
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${action.color} mb-2`}>
                                                        <action.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium">{action.title}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card> */}

                                <Card className="col-span-4 border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader className="pb-2">
                                        <CardTitle>Loan Distribution</CardTitle>
                                        <CardDescription>Distribution by loan type and status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="rounded-lg bg-muted/40 dark:bg-muted/20 p-4">
                                                <h4 className="text-sm font-medium mb-2">By Loan Type</h4>
                                                <div className="space-y-2">
                                                    {dashboardData.loanTypeDistribution.length > 0 ? (
                                                        dashboardData.loanTypeDistribution.map((item: LoanTypeDistribution, i: number) => (
                                                            <div key={i} className="space-y-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span>{item.name}</span>
                                                                    <span className="font-medium">{item.percentage}%</span>
                                                                </div>
                                                                <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-muted/40">
                                                                    <div
                                                                        className={`h-2 rounded-full bg-primary`}
                                                                        style={{ width: `${item.percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-2">
                                                            <p className="text-xs text-muted-foreground">No loan type data available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-muted/40 dark:bg-muted/20 p-4">
                                                <h4 className="text-sm font-medium mb-2">By Status</h4>
                                                <div className="space-y-2">
                                                    {dashboardData.statusDistribution.length > 0 ? (
                                                        dashboardData.statusDistribution.map((item: StatusDistribution, i: number) => {
                                                            const getStatusColor = (status: string) => {
                                                                switch(status) {
                                                                    case 'approved': return 'bg-emerald-500';
                                                                    case 'rejected': return 'bg-red-500';
                                                                    case 'pending': return 'bg-amber-500';
                                                                    case 'disbursed': return 'bg-blue-500';
                                                                    case 'completed': return 'bg-purple-500';
                                                                    default: return 'bg-gray-500';
                                                                }
                                                            };
                                                            
                                                            return (
                                                                <div key={i} className="space-y-1">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                                                                        <span className="font-medium">{item.percentage}%</span>
                                                                    </div>
                                                                    <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-muted/40">
                                                                        <div
                                                                            className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                                                                            style={{ width: `${item.percentage}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center py-2">
                                                            <p className="text-xs text-muted-foreground">No status data available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                                <Card className="col-span-1 border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <CardTitle>Loan Distribution</CardTitle>
                                        <CardDescription>Distribution of loans by type and amount</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="h-[300px] w-full rounded-md bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-muted-foreground"
                                        >
                                            <div className="text-center">
                                                <DollarSign className="h-10 w-10 mx-auto mb-2 text-primary" />
                                                <p>Loan Distribution Chart</p>
                                                {dashboardData.loanTypeDistribution.length > 0 ? (
                                                    <p className="text-sm mt-2">{dashboardData.loanTypeDistribution.length} loan types available</p>
                                                ) : (
                                                    <p className="text-sm mt-2">No loan distribution data available yet</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>

                                <Card className="col-span-1 border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <CardTitle>Customer Demographics</CardTitle>
                                        <CardDescription>Breakdown of customer base by key metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="h-[300px] w-full rounded-md bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-muted-foreground"
                                        >
                                            <div className="text-center">
                                                <Users className="h-10 w-10 mx-auto mb-2 text-primary" />
                                                <p>Demographics Chart</p>
                                                <p className="text-sm mt-2">User demographic data will appear here</p>
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-6">
                            <Card className="border border-border rounded-xl bg-card hover:shadow-lg transition-all">
                                <CardHeader>
                                    <CardTitle>Available Reports</CardTitle>
                                    <CardDescription>Download or view detailed reports</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        "Monthly Performance",
                                        "Loan Portfolio",
                                        "Risk Assessment",
                                        "Customer Insights",
                                        "Compliance Report",
                                    ].map((report, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.1 }}
                                            className="flex items-center justify-between border-b border-border pb-3 group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">{report}</p>
                                                <p className="text-sm text-muted-foreground">Last updated: {currentDate}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    View
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Download
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </>
    )
}
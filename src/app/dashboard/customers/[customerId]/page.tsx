"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, CreditCard, Home, AlertCircle, Banknote } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"

// Define interfaces for type safety
interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  address: string;
  totalAmount: string;
  loans: number;
  loanDetails: any[];
  rawData: any;
}

interface TransactionData {
  id: string;
  customer: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  reference: string;
  raw: {
    userId: number;
    applicationId: number;
    transactionId: number;
    transactionDate: string;
    balanceAfter: number;
    description: string;
    [key: string]: any;
  };
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.customerId as string
  
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Fetch the customer data when the component mounts
    fetchData()
  }, [customerId])
  
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch customer data, transactions, and loan applications
      const [customerResponse, transactionResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/crud-users/read-user-data?id=${customerId}`),
        fetch(`/api/crud-users/read-transactions?limit=10`),
        fetch(`/api/crud-users/read-applications?userId=${customerId}`)
      ]);
      
      const [customerResult, transactionResult, applicationsResult] = await Promise.all([
        customerResponse.json(),
        transactionResponse.json(),
        applicationsResponse.json()
      ]);
      
      if (customerResult.success && customerResult.data) {
        // Get all transactions for this user
        const userTransactions = transactionResult.success 
          ? transactionResult.data.filter((t: TransactionData) => 
              // Extract numeric ID from CUST-XXXX format
              t.raw.userId === parseInt(customerId.replace('CUST-', ''), 10)
            )
          : [];
        
        setTransactions(userTransactions);
        
        // Get loan applications for display
        const loanApplications = applicationsResult.success ? applicationsResult.data : [];
        
        // Format the user data for display with transaction and application information
        setCustomer(formatUserData(customerResult.data, userTransactions, loanApplications))
        setError(null)
      } else {
        setError(customerResult.message || "Failed to fetch customer details")
        setCustomer(null)
      }
    } catch (err) {
      console.error("Error fetching customer data:", err)
      setError("An error occurred while fetching customer data")
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }
  
  // Process loan applications for display
  const getLoanInfo = (userData: any, transactions: TransactionData[], applications: any[] = []) => {
    // If we have direct loan application data, use that
    if (applications && applications.length > 0) {
      // Map applications to loan details format
      const loanDetails = applications.map(app => {
        // Calculate loan progress if available from transactions
        const disbursement = transactions.find(
          t => t.type === 'Disbursement' && t.raw.applicationId === app.raw.id
        );
        
        const repayments = transactions.filter(
          t => t.type === 'Repayment' && t.raw.applicationId === app.raw.id
        );
        
        const repaidAmount = repayments.reduce((sum, t) => {
          const amount = parseFloat(t.amount.replace(/[R,]/g, '')) || 0;
          return sum + amount;
        }, 0);
        
        const loanAmount = parseFloat(app.amount.replace(/[R,]/g, '')) || 0;
        
        return {
          id: app.id,
          amount: app.amount,
          date: app.date,
          status: app.status,
          type: app.purpose || "Personal",
          interestRate: app.interestRate,
          term: app.term,
          repaidAmount: `R${repaidAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          remainingAmount: `R${Math.max(0, loanAmount - repaidAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          progress: loanAmount > 0 ? Math.min(100, Math.round((repaidAmount / loanAmount) * 100)) : 0
        };
      });
      
      // Calculate total loan amount from applications
      const totalAmount = applications.reduce((sum, app) => {
        const amount = parseFloat(app.amount.replace(/[R,]/g, '')) || 0;
        return sum + amount;
      }, 0);
      
      return {
        loanCount: applications.length,
        totalAmount: `R${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        loanDetails
      };
    } 
    // Fallback to extracting from transactions if no applications data
    else {
      // Get unique loan applications
      const loanApplications = new Set<number>();
      
      transactions.forEach(t => {
        if (t.type === 'Disbursement') {
          loanApplications.add(t.raw.applicationId);
        }
      });
      
      // Calculate total loan amount from disbursements
      const totalAmount = transactions
        .filter(t => t.type === 'Disbursement')
        .reduce((sum, t) => {
          const amount = parseFloat(t.amount.replace(/[R,]/g, '')) || 0;
          return sum + amount;
        }, 0);
      
      // Create loan details from unique applications
      const loanDetails = Array.from(loanApplications).map(applicationId => {
        // Get disbursement transaction for this application
        const disbursement = transactions.find(
          t => t.type === 'Disbursement' && t.raw.applicationId === applicationId
        );
        
        // Get repayments for this application
        const repayments = transactions.filter(
          t => t.type === 'Repayment' && t.raw.applicationId === applicationId
        );
        
        // Calculate repaid amount
        const repaidAmount = repayments.reduce((sum, t) => {
          const amount = parseFloat(t.amount.replace(/[R,]/g, '')) || 0;
          return sum + amount;
        }, 0);
        
        // Parse disbursement amount
        const loanAmount = disbursement 
          ? parseFloat(disbursement.amount.replace(/[R,]/g, '')) || 0
          : 0;
        
        return {
          id: `LOAN-${applicationId.toString().padStart(4, '0')}`,
          amount: `R${loanAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          date: disbursement ? disbursement.date : "Unknown",
          status: repaidAmount >= loanAmount ? "Completed" : "Active",
          type: "Personal", // This would need to come from the application data
          repaidAmount: `R${repaidAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          remainingAmount: `R${Math.max(0, loanAmount - repaidAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          progress: loanAmount > 0 ? Math.min(100, Math.round((repaidAmount / loanAmount) * 100)) : 0
        };
      });
      
      return {
        loanCount: loanApplications.size,
        totalAmount: `R${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        loanDetails
      };
    }
  }
  
  // Format user data to match the UI requirements
  const formatUserData = (userData: any, transactions: TransactionData[], loanApplications: any[] = []): CustomerData => {
    // Get loan information from applications and transactions
    const { loanCount, totalAmount, loanDetails } = getLoanInfo(userData, transactions, loanApplications);
    
    return {
      id: `CUST-${userData.id.toString().padStart(4, '0')}`,
      name: `${userData.firstname} ${userData.lastname}`,
      email: userData.email,
      phone: userData.phone || "Not provided",
      loans: loanCount,
      totalAmount,
      status: userData.deleted === 1 ? "Deleted" : (userData.status === 1 ? "Inactive" : "Active"),
      joinDate: userData.signupDate || "Unknown",
      address: userData.address || "No address provided",
      loanDetails,
      rawData: userData
    }
  }
  
  // If loading, show loading skeleton
  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6 border-2 border-yellow-400"
          onClick={() => router.back()}
          disabled
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-2 border-yellow-400 shadow-lg animate-pulse">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // If error or customer not found, show error message
  if (error || !customer) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6 border-2 border-yellow-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-2 border-yellow-400 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || `The customer with ID ${customerId} could not be found.`}
            </p>
            <Button onClick={() => router.push('/dashboard/customers')} className="bg-yellow-400 text-black hover:bg-yellow-500">
              Return to Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 p-4 md:p-8 bg-white dark:bg-black"
    >
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className=" bg-yellow-400 hover:bg-gray-400 text-black dark:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-black dark:text-white">Customer Name: {customer.name}</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          customer.status === "Active" 
            ? "bg-green-400 text-black" 
            : customer.status === "Deleted"
            ? "bg-red-400 text-black"
            : "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
        }`}>
          {customer.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-1"
        >
          <Card className="border-2 border-black shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Customer Info</span>
                <span className="text-xs font-normal text-muted-foreground">ID: {customer.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{customer.email}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <Phone className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{customer.phone}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Joined: {customer.joinDate}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Total loans: {customer.totalAmount}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <Banknote className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Active loans: {customer.loans}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{customer.address}</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="border-2 border-black dark:border-white shadow-md h-full">
            <CardHeader className="pb-2 border-b">
              <CardTitle>Loan History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {customer.loanDetails && customer.loanDetails.length > 0 ? (
                <div className="space-y-4">
                  {customer.loanDetails.map((loan: any) => (
                    <div key={loan.id} className="border rounded-md p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{loan.id}</div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          loan.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {loan.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 mt-2 text-sm gap-2">
                        <div>
                          <div className="text-muted-foreground">Amount</div>
                          <div>{loan.amount}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Date</div>
                          <div>{loan.date}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div>{loan.type}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Repaid</div>
                          <div>{loan.repaidAmount}</div>
                        </div>
                      </div>
                      
                      {/* Loan progress bar */}
                      <div className="mt-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${loan.status === "Active" ? "bg-blue-500" : "bg-green-500"}`}
                            style={{ width: `${loan.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-right mt-1">{loan.progress}% complete</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-12 w-12 text-yellow-500 opacity-40 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Loans Found</h3>
                  <p className="text-muted-foreground">This customer doesn't have any active loans.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Transactions Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-3"
        >
          <Card className="border-2 border-black dark:border-white shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              transaction.type === "Disbursement"
                                ? "bg-blue-100 text-blue-800"
                                : transaction.type === "Repayment"
                                  ? "bg-purple-100 text-purple-800"
                                  : transaction.type === "Fee"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              transaction.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : transaction.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="h-12 w-12 text-yellow-500 opacity-40 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Transactions Found</h3>
                  <p className="text-muted-foreground">This customer doesn't have any transactions yet.</p>
                </div>
              )}
              
              {transactions.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/transactions?userId=${customer.rawData.id}`)}
                  >
                    View All Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
} 
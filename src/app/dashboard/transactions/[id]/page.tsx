"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, CreditCard, Landmark, User, DollarSign, Tag, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Sample data for transactions (same as in the main page)
const transactions = [
  {
    id: "TRX-1001",
    customer: "John Smith",
    type: "Disbursement",
    amount: "$5,000",
    status: "Completed",
    date: "Apr 16, 2025",
    reference: "LOAN-3456",
    customerEmail: "john.smith@example.com",
    customerPhone: "(555) 123-4567",
    processingTime: "2 minutes",
    paymentMethod: "Bank Transfer",
    accountNumber: "****3456",
    notes: "Loan disbursement for home renovation project",
  },
  {
    id: "TRX-1002",
    customer: "Sarah Johnson",
    type: "Repayment",
    amount: "$350",
    status: "Completed",
    date: "Apr 15, 2025",
    reference: "LOAN-2789",
    customerEmail: "sarah.j@example.com",
    customerPhone: "(555) 234-5678",
    processingTime: "1 minute",
    paymentMethod: "Credit Card",
    accountNumber: "****7890",
    notes: "Regular monthly payment",
  },
  {
    id: "TRX-1003",
    customer: "Michael Brown",
    type: "Disbursement",
    amount: "$3,500",
    status: "Pending",
    date: "Apr 15, 2025",
    reference: "LOAN-4567",
    customerEmail: "michael.b@example.com",
    customerPhone: "(555) 345-6789",
    processingTime: "Pending",
    paymentMethod: "Bank Transfer",
    accountNumber: "****5678",
    notes: "Awaiting final approval from supervisor",
  },
  {
    id: "TRX-1004",
    customer: "Emily Davis",
    type: "Repayment",
    amount: "$420",
    status: "Completed",
    date: "Apr 14, 2025",
    reference: "LOAN-1234",
    customerEmail: "emily.d@example.com",
    customerPhone: "(555) 456-7890",
    processingTime: "3 minutes",
    paymentMethod: "Debit Card",
    accountNumber: "****1234",
    notes: "Regular monthly payment",
  },
  {
    id: "TRX-1005",
    customer: "David Wilson",
    type: "Disbursement",
    amount: "$15,000",
    status: "Completed",
    date: "Apr 14, 2025",
    reference: "LOAN-5678",
    customerEmail: "david.w@example.com",
    customerPhone: "(555) 567-8901",
    processingTime: "5 minutes",
    paymentMethod: "Bank Transfer",
    accountNumber: "****6789",
    notes: "Business expansion loan",
  },
  {
    id: "TRX-1006",
    customer: "Jennifer Lee",
    type: "Repayment",
    amount: "$550",
    status: "Failed",
    date: "Apr 13, 2025",
    reference: "LOAN-6789",
    customerEmail: "jennifer.l@example.com",
    customerPhone: "(555) 678-9012",
    processingTime: "Failed",
    paymentMethod: "Credit Card",
    accountNumber: "****2345",
    notes: "Card declined, customer notified",
  },
  {
    id: "TRX-1007",
    customer: "Robert Taylor",
    type: "Disbursement",
    amount: "$12,000",
    status: "Completed",
    date: "Apr 13, 2025",
    reference: "LOAN-7890",
    customerEmail: "robert.t@example.com",
    customerPhone: "(555) 789-0123",
    processingTime: "4 minutes",
    paymentMethod: "Bank Transfer",
    accountNumber: "****7890",
    notes: "Home improvement loan",
  },
  {
    id: "TRX-1008",
    customer: "Lisa Anderson",
    type: "Repayment",
    amount: "$375",
    status: "Completed",
    date: "Apr 12, 2025",
    reference: "LOAN-8901",
    customerEmail: "lisa.a@example.com",
    customerPhone: "(555) 890-1234",
    processingTime: "2 minutes",
    paymentMethod: "Debit Card",
    accountNumber: "****8901",
    notes: "Regular monthly payment",
  },
]

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.id as string
  
  // Find the transaction by ID
  const transaction = transactions.find(t => t.id === transactionId)
  
  if (!transaction) {
    return (
      <div className="flex-1 p-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
              <p className="text-muted-foreground">The transaction you're looking for doesn't exist or has been removed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transaction Details</h2>
        <div
          className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
            transaction.status === "Completed"
              ? "bg-emerald-100 text-emerald-800"
              : transaction.status === "Failed"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {transaction.status}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
            <CardDescription>Detailed information about this transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Transaction ID</div>
                  <div className="text-lg font-medium">{transaction.id}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Reference</div>
                  <div className="text-lg font-medium">{transaction.reference}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div 
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      transaction.type === "Disbursement"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {transaction.type}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="text-lg font-medium">{transaction.amount}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {transaction.date}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {transaction.processingTime}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    {transaction.paymentMethod}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Account Number</div>
                  <div className="flex items-center">
                    <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
                    {transaction.accountNumber}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Information about the customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  {transaction.customer}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm">{transaction.customerEmail}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-sm">{transaction.customerPhone}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Additional information</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{transaction.notes}</p>
        </CardContent>
      </Card>
    </div>
  )
} 
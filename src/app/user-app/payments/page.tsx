"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, DollarSign, FileText, Info, Wallet, Download } from "lucide-react"

export default function PaymentsPage() {
  // Sample user data
  const user = {
    loans: [
      {
        id: "LOAN-001",
        type: "Personal Loan",
        balance: 8500.0,
        nextPayment: {
          amount: 350.0,
          date: "May 15, 2025",
        },
      },
      {
        id: "LOAN-002",
        type: "Auto Loan",
        balance: 7250.0,
        nextPayment: {
          amount: 275.0,
          date: "May 20, 2025",
        },
      },
    ],
    paymentMethods: [
      {
        id: "PM-001",
        type: "Credit Card",
        last4: "4242",
        expiry: "05/28",
        isDefault: true,
      },
      {
        id: "PM-002",
        type: "Bank Account",
        last4: "9876",
        bankName: "Chase Bank",
        isDefault: false,
      },
    ],
    paymentHistory: [
      {
        id: "PMT-1001",
        date: "Apr 15, 2025",
        amount: 350.0,
        loanId: "LOAN-001",
        status: "Completed",
      },
      {
        id: "PMT-1002",
        date: "Apr 20, 2025",
        amount: 275.0,
        loanId: "LOAN-002",
        status: "Completed",
      },
      {
        id: "PMT-1003",
        date: "Mar 15, 2025",
        amount: 350.0,
        loanId: "LOAN-001",
        status: "Completed",
      },
      {
        id: "PMT-1004",
        date: "Mar 20, 2025",
        amount: 275.0,
        loanId: "LOAN-002",
        status: "Completed",
      },
    ],
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage your loan payments and payment methods</p>
        </div>
      </div>

      <Tabs defaultValue="make-payment" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="make-payment" className="rounded-md">
            Make a Payment
          </TabsTrigger>
          <TabsTrigger value="payment-history" className="rounded-md">
            Payment History
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="rounded-md">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="make-payment" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Make a Payment</CardTitle>
              <CardDescription>Pay your loan balance</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  window.alert("Payment submitted successfully!")
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan">Select Loan</Label>
                    <Select defaultValue={user.loans[0].id}>
                      <SelectTrigger id="loan">
                        <SelectValue placeholder="Select a loan" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.loans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            {loan.type} ({loan.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Payment Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          defaultValue={user.loans[0].nextPayment.amount.toFixed(2)}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Payment Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="date" type="date" className="pl-8" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select defaultValue={user.paymentMethods.find((pm) => pm.isDefault)?.id}>
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.type} (**** {method.last4}){method.isDefault && " (Default)"}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Add New Payment Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-start gap-4">
                      <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium">Payment Information</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your payment will be processed immediately. It may take 1-3 business days for the payment to
                          be reflected in your account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full md:w-auto">
                    Make Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>View your scheduled payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.loans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{loan.type}</p>
                        <p className="text-sm text-muted-foreground">Due on {loan.nextPayment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${loan.nextPayment.amount.toFixed(2)}</p>
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <Link href={`/user-dashboard/loans/${loan.id}`}>View Loan</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your past payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Payment for {user.loans.find((loan) => loan.id === payment.loanId)?.type}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">${payment.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="rounded-full">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/user-dashboard/payments/history">View Full Payment History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Payment Receipts</CardTitle>
              <CardDescription>Download receipts for your payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.paymentHistory.slice(0, 2).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Receipt #{payment.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date} • ${payment.amount.toFixed(2)}
                        </p>
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

        <TabsContent value="payment-methods" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {method.type === "Credit Card" ? (
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type} {method.isDefault && <span className="text-xs text-primary">(Default)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === "Credit Card"
                            ? `**** **** **** ${method.last4} • Expires ${method.expiry}`
                            : `${method.bankName} **** ${method.last4}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.alert(`Set ${method.type} as default payment method`)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.alert(`Removing ${method.type} from payment methods`)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={() => window.alert("Adding new payment method")}>Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Auto-Pay Settings</CardTitle>
              <CardDescription>Set up automatic payments for your loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {user.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4"
                  >
                    <div>
                      <h3 className="font-medium">{loan.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Monthly payment: ${loan.nextPayment.amount.toFixed(2)} • Due on the 15th
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button variant="outline" onClick={() => window.alert(`Setting up auto-pay for ${loan.type}`)}>
                        Set Up Auto-Pay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

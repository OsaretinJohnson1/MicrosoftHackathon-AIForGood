"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, FileText, Search, Filter } from "lucide-react"

export default function StatementsPage() {
  // Sample statements data
  const statements = {
    monthly: [
      {
        id: "STMT-1001",
        period: "April 2025",
        date: "May 1, 2025",
        type: "Monthly Statement",
        size: "245 KB",
      },
      {
        id: "STMT-1002",
        period: "March 2025",
        date: "April 1, 2025",
        type: "Monthly Statement",
        size: "238 KB",
      },
      {
        id: "STMT-1003",
        period: "February 2025",
        date: "March 1, 2025",
        type: "Monthly Statement",
        size: "256 KB",
      },
      {
        id: "STMT-1004",
        period: "January 2025",
        date: "February 1, 2025",
        type: "Monthly Statement",
        size: "242 KB",
      },
      {
        id: "STMT-1005",
        period: "December 2024",
        date: "January 1, 2025",
        type: "Monthly Statement",
        size: "251 KB",
      },
      {
        id: "STMT-1006",
        period: "November 2024",
        date: "December 1, 2024",
        type: "Monthly Statement",
        size: "247 KB",
      },
    ],
    annual: [
      {
        id: "STMT-A001",
        period: "2024",
        date: "January 15, 2025",
        type: "Annual Summary",
        size: "1.2 MB",
      },
      {
        id: "STMT-A002",
        period: "2023",
        date: "January 15, 2024",
        type: "Annual Summary",
        size: "1.1 MB",
      },
    ],
    tax: [
      {
        id: "STMT-T001",
        period: "2024",
        date: "January 31, 2025",
        type: "Tax Statement",
        size: "320 KB",
      },
      {
        id: "STMT-T002",
        period: "2023",
        date: "January 31, 2024",
        type: "Tax Statement",
        size: "315 KB",
      },
    ],
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Statements</h2>
          <p className="text-muted-foreground">Access and download your account statements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => window.alert("Generating statement...")}>
            <FileText className="mr-2 h-4 w-4" />
            Request Statement
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search statements..." className="pl-8 w-full md:w-[300px] rounded-full" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px] rounded-full">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statements</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="tax">Tax</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="monthly" className="rounded-md">
            Monthly Statements
          </TabsTrigger>
          <TabsTrigger value="annual" className="rounded-md">
            Annual Summaries
          </TabsTrigger>
          <TabsTrigger value="tax" className="rounded-md">
            Tax Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Monthly Statements</CardTitle>
              <CardDescription>Your monthly account activity and balance summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statements.monthly.map((statement) => (
                  <div key={statement.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{statement.period} Statement</p>
                        <p className="text-sm text-muted-foreground">
                          Generated on {statement.date} • {statement.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user-dashboard/statements/${statement.id}`}>View</Link>
                      </Button>
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Annual Summaries</CardTitle>
              <CardDescription>Yearly summaries of your account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statements.annual.map((statement) => (
                  <div key={statement.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{statement.period} Annual Summary</p>
                        <p className="text-sm text-muted-foreground">
                          Generated on {statement.date} • {statement.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user-dashboard/statements/${statement.id}`}>View</Link>
                      </Button>
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Tax Documents</CardTitle>
              <CardDescription>Tax-related statements and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statements.tax.map((statement) => (
                  <div key={statement.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{statement.period} Tax Statement</p>
                        <p className="text-sm text-muted-foreground">
                          Generated on {statement.date} • {statement.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user-dashboard/statements/${statement.id}`}>View</Link>
                      </Button>
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>Important information about your loan tax documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/10 p-4 mb-4">
                <h3 className="font-medium mb-2">Tax Document Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Tax documents are typically available by January 31st each year. These documents contain important
                  information that may be needed for your tax return, including:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>Interest paid on loans</li>
                  <li>Loan origination fees</li>
                  <li>Other tax-deductible expenses</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/user-dashboard/support/tax">Tax Support Center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

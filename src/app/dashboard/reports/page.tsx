"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calendar, Download, FileText, PieChart, TrendingUp } from "lucide-react"

// Sample report data
const reports = [
  {
    id: "REP-001",
    title: "Monthly Performance Report",
    description: "Overview of loan performance for the current month",
    category: "Performance",
    lastUpdated: "Apr 16, 2025",
    icon: TrendingUp,
  },
  {
    id: "REP-002",
    title: "Loan Portfolio Analysis",
    description: "Detailed breakdown of the current loan portfolio",
    category: "Portfolio",
    lastUpdated: "Apr 15, 2025",
    icon: PieChart,
  },
  {
    id: "REP-003",
    title: "Customer Demographics",
    description: "Analysis of customer base by demographics",
    category: "Customers",
    lastUpdated: "Apr 14, 2025",
    icon: BarChart3,
  },
  {
    id: "REP-004",
    title: "Quarterly Financial Report",
    description: "Financial performance for Q1 2025",
    category: "Financial",
    lastUpdated: "Apr 10, 2025",
    icon: FileText,
  },
  {
    id: "REP-005",
    title: "Risk Assessment Report",
    description: "Analysis of loan portfolio risk factors",
    category: "Risk",
    lastUpdated: "Apr 8, 2025",
    icon: TrendingUp,
  },
  {
    id: "REP-006",
    title: "Compliance Audit Report",
    description: "Regulatory compliance status report",
    category: "Compliance",
    lastUpdated: "Apr 5, 2025",
    icon: FileText,
  },
]

// Scheduled reports
const scheduledReports = [
  {
    id: "SCH-001",
    title: "Weekly Performance Summary",
    frequency: "Weekly",
    nextRun: "Apr 22, 2025",
    recipients: "Finance Team",
  },
  {
    id: "SCH-002",
    title: "Monthly Portfolio Review",
    frequency: "Monthly",
    nextRun: "May 1, 2025",
    recipients: "Executive Team",
  },
  {
    id: "SCH-003",
    title: "Quarterly Compliance Report",
    frequency: "Quarterly",
    nextRun: "Jul 1, 2025",
    recipients: "Compliance Team",
  },
]

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center gap-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-md font-medium">{report.title}</CardTitle>
                  <report.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last updated: {report.lastUpdated}</span>
                    <Button>
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Reports that are automatically generated on a schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.frequency} • Next run: {report.nextRun}
                      </p>
                      <p className="text-sm text-muted-foreground">Recipients: {report.recipients}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button>
                        Edit
                      </Button>
                      <Button>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create custom reports based on your specific requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Create a Custom Report</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Select data sources, filters, and visualization options to create a tailored report for your specific
                  needs.
                </p>
                <Button>Start Building</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

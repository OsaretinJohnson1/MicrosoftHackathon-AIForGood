"use client"

import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, FileText, User, XCircle, Check, X, CreditCard, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { Label } from "../../../../components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@clerk/clerk-react"

// Updated interface to match our database schema
interface Application {
  id: number;
  userId: number;
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number;
  purpose: string;
  workAddress: string;
  employer: string;
  employmentType: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  bankName: string;
  payDate: string;
  paymentSchedule: string;
  applicationDate: string;
  approvedBy?: number;
  approvedDate?: string;
  status: string; // pending, approved, rejected, disbursed, completed, defaulted
  rejectionReason?: string;
  documents?: string;
  notes?: string;
  monthlyPayment?: number;
  totalPayable?: number;
  totalInterest?: number;
  nextPaymentDate?: string;
  remainingBalance?: number;
  // Added for UI compatibility with existing code
  loanPurpose?: string;
  loanTerm?: number;
  rejectedDate?: string;
  disbursedDate?: string;
  completedDate?: string;
  disbursedAmount?: number;
  user?: {
    firstName: string;
    lastName: string;
  };
}

// Utility functions to replace the missing imports
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [disbursedAmount, setDisbursedAmount] = useState("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchApplicationData();
  }, [applicationId]);

  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // We'll pass the ID as-is to the API, which will handle the extraction
      const response = await fetch(`/api/crud-users/read-application?id=${applicationId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const appData = result.data;
        
        // Set compatibility fields for UI
        appData.loanPurpose = appData.purpose;
        appData.loanTerm = appData.loanTermMonths;
        
        setApplication(appData);
        setError(null);
        setNewStatus(appData.status);
        
        // After getting application, fetch user data
        if (appData.userId) {
          fetchUserData(appData.userId);
        }
      } else {
        setError(result.message || "Failed to fetch application details");
        setApplication(null);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
      setError("An error occurred while fetching application data");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserData = async (userId: number) => {
    try {
      const response = await fetch(`/api/crud-users/user?id=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const user = result.data;
        
        // Update application with user data for UI compatibility
        setApplication(prev => {
          if (!prev) return null;
          return {
            ...prev,
            user: {
              firstName: user.firstname,
              lastName: user.lastname
            }
          };
        });
        
        setUserData(user);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!application || !newStatus) return;

    setUpdating(true);
    
    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === "rejected") {
      if (!rejectionReason) {
        toast.error("Rejection reason is required");
        setUpdating(false);
        return;
      }
      updateData.rejectionReason = rejectionReason;
    } else if (newStatus === "disbursed") {
      if (!disbursedAmount) {
        toast.error("Disbursed amount is required");
        setUpdating(false);
        return;
      }
      updateData.disbursedAmount = parseFloat(disbursedAmount);
    }

    try {
      // Use the application ID as stored in the database
      const response = await fetch(`/api/crud-users/update-application?id=${application.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Application status updated to ${newStatus}`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message || "Failed to update application status");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error("An error occurred while updating application status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'processing':
        return 'bg-blue-400 hover:bg-blue-500';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'disbursed':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'completed':
        return 'bg-green-700 hover:bg-green-800';
      case 'defaulted':
        return 'bg-red-700 hover:bg-red-800';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleApprove = () => {
    setNewStatus("approved");
    handleUpdateStatus();
  };

  const handleReject = () => {
    setNewStatus("rejected");
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex-1 p-8">
        <Button 
          variant="outline" 
          className="mb-6 border-2 border-yellow-400" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        
        <Card className="border-2 border-yellow-400 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-yellow-100 p-4 mb-4">
              <FileText className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The application ID {params.id} does not exist or has been removed.
            </p>
            <Button onClick={handleBack} className="bg-yellow-400 text-black hover:bg-yellow-500">Return to Applications</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Application Details</h1>
          <p className="text-gray-500">
            Loan application from {application.user?.firstName} {application.user?.lastName}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/applications")}>
          Back to Applications
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-yellow-400 hover:bg-gray-400 text-black dark:text-white"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Application {application.id}</h2>
                <Badge 
                  className={`ml-2 ${
                    application.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      : application.status === "rejected"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-black dark:border-white shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Loan Details</CardTitle>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        Application submitted on {formatDate(application.applicationDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Loan Information</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Loan Amount:</span>
                              <span className="font-medium">{formatCurrency(application.loanAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Loan Term:</span>
                              <span className="font-medium">{application.loanTerm} months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Interest Rate:</span>
                              <span className="font-medium">{application.interestRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Loan Purpose:</span>
                              <span className="font-medium">{application.loanPurpose}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Status History</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Created:</span>
                              <span className="font-medium">{formatDate(application.applicationDate)}</span>
                            </div>
                            {application.approvedDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Approved:</span>
                                <span className="font-medium">{formatDate(application.approvedDate)}</span>
                              </div>
                            )}
                            {application.rejectedDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rejected:</span>
                                <span className="font-medium">{formatDate(application.rejectedDate)}</span>
                              </div>
                            )}
                            {application.disbursedDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Disbursed:</span>
                                <span className="font-medium">{formatDate(application.disbursedDate)}</span>
                              </div>
                            )}
                            {application.completedDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Completed:</span>
                                <span className="font-medium">{formatDate(application.completedDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {application.rejectionReason && (
                        <div className="mt-4">
                          <h3 className="font-semibold mb-2">Rejection Reason</h3>
                          <p className="p-3 bg-red-50 text-red-800 rounded">{application.rejectionReason}</p>
                        </div>
                      )}

                      {application.disbursedAmount && (
                        <div className="mt-4">
                          <h3 className="font-semibold mb-2">Disbursed Amount</h3>
                          <p className="p-3 bg-blue-50 text-blue-800 rounded">{formatCurrency(application.disbursedAmount)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-black dark:border-white shadow-md">
                    <CardHeader>
                      <CardTitle>Update Application Status</CardTitle>
                      <CardDescription>
                        Change the status of this loan application
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="status">New Status</Label>
                          <Select
                            value={newStatus}
                            onValueChange={setNewStatus}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="disbursed">Disbursed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {newStatus === "rejected" && (
                          <div>
                            <Label htmlFor="rejectionReason">Rejection Reason</Label>
                            <Textarea
                              id="rejectionReason"
                              placeholder="Provide reason for rejection"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                        )}

                        {newStatus === "disbursed" && (
                          <div>
                            <Label htmlFor="disbursedAmount">Disbursed Amount</Label>
                            <Input
                              id="disbursedAmount"
                              type="number"
                              placeholder="Enter the amount to disburse"
                              value={disbursedAmount}
                              onChange={(e) => setDisbursedAmount(e.target.value)}
                            />
                          </div>
                        )}

                        <Button 
                          onClick={handleUpdateStatus} 
                          disabled={updating || application.status === newStatus}
                          className="w-full"
                        >
                          {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Status"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-2 border-black dark:border-white shadow-md">
                    <CardHeader>
                      <CardTitle>Application Status</CardTitle>
                      <CardDescription>Current status: {application.status}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-4 rounded-lg mb-4 ${
                        application.status === "approved"
                          ? "bg-emerald-50 border border-emerald-200"
                          : application.status === "rejected" 
                            ? "bg-red-50 border border-red-200"
                            : "bg-yellow-400 border border-yellow-200"
                      }`}>
                        <div className="flex items-start">
                          {application.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 mr-2 text-emerald-600 mt-0.5" />
                          ) : application.status === "rejected" ? (
                            <XCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                          ) : (
                            <Clock className="h-5 w-5 mr-2 text-yellow-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium">
                              {application.status === "approved" 
                                ? "Application Approved" 
                                : application.status === "rejected"
                                  ? "Application Rejected"
                                  : "Pending Review"}
                            </h4>
                            <p className="text-sm mt-1">
                              {application.status === "approved" 
                                ? "This application has been approved and is ready for processing." 
                                : application.status === "rejected"
                                  ? "This application has been declined. See notes for details."
                                  : "This application is waiting for review and decision."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Notes</div>
                        <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                          {application.notes || "No additional notes for this application."}
                        </p>
                      </div>
                    </CardContent>
                    {application.status === "pending" && (
                      <CardFooter className="flex gap-2">
                        <Button 
                          className="w-1/2" 
                          variant="outline"
                          onClick={handleReject}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          className="w-1/2 bg-yellow-400 text-black hover:bg-yellow-500"
                          onClick={handleApprove}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
              <CardDescription>
                Customer details for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{application.user?.firstName} {application.user?.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{userData?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{userData?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ID Number:</span>
                      <p className="font-medium">{userData?.idNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <p className="font-medium">{userData?.gender}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date of Birth:</span>
                      <p className="font-medium">{new Date(userData?.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <p className="font-medium">{userData?.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
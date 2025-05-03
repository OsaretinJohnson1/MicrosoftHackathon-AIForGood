import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArrowUpRight, Clock, DollarSign, FileText, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default async function LoansPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Placeholder data - would typically come from API/backend
  const activeLoans = [
    { 
      id: "L123456",
      amount: 250000,
      disbursementDate: "2023-06-01",
      term: 12,
      interestRate: 15,
      monthlyPayment: 15000,
      nextPaymentDate: "2023-07-15",
      remainingBalance: 220000,
      status: "active"
    }
  ];
  
  const completedLoans = [
    { 
      id: "L098765",
      amount: 150000,
      disbursementDate: "2022-02-15",
      term: 6,
      interestRate: 15,
      monthlyPayment: 26500,
      completionDate: "2022-08-15",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Loans</h1>
        
        {/* Active Loans */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Active Loans</h2>
            <Link href="/dashboard/loans/apply" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition duration-200">
              Apply for Loan <Plus className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {activeLoans.length > 0 ? (
            <div className="grid gap-4">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                        Loan #{loan.id} 
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Disbursement Date: {new Date(loan.disbursementDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/loans/${loan.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm flex items-center">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">KES {loan.amount.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">KES {loan.monthlyPayment.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Next Payment Due</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">{new Date(loan.nextPaymentDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">KES {loan.remainingBalance.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <Link href={`/dashboard/payments/make?loan=${loan.id}`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition duration-200">
                      <DollarSign className="mr-1 h-4 w-4" /> Make Payment
                    </Link>
                    <Link href={`/dashboard/loans/${loan.id}/schedule`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition duration-200">
                      <Clock className="mr-1 h-4 w-4" /> Payment Schedule
                    </Link>
                    <Link href={`/dashboard/loans/${loan.id}/documents`} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition duration-200">
                      <FileText className="mr-1 h-4 w-4" /> Documents
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any active loans</p>
              <Link href="/dashboard/loans/apply" className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition duration-200">
                Apply for a Loan
              </Link>
            </div>
          )}
        </div>
        
        {/* Completed Loans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Loan History</h2>
          
          {completedLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loan ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Term</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Disbursement Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Completion Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {completedLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{loan.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">KES {loan.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{loan.term} months</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{new Date(loan.disbursementDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{new Date(loan.completionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        <Link href={`/dashboard/loans/${loan.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any completed loans</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
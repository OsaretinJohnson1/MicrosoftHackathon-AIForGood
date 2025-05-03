"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Download, Filter, Search, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch transactions when page, search, or filter changes
  useEffect(() => {
    fetchTransactions()
  }, [currentPage, transactionType])

  // Function to fetch transactions from the API
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      let url = `/api/crud-users/read-transactions?page=${currentPage}&limit=${limit}`
      
      if (transactionType !== "all") {
        url += `&type=${transactionType}`
      }
      
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`
      }
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.data || [])
        
        // Set pagination details
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1)
          setTotalItems(result.pagination.totalItems || 0)
        }
        
        setError(null)
      } else {
        setError(result.message || "Failed to fetch transactions")
        setTransactions([])
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("An error occurred while fetching transactions")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  // Handle search input
  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page on search
    fetchTransactions()
  }
  
  // Calculate pagination information
  const startIndex = (currentPage - 1) * limit
  const endIndex = Math.min(startIndex + limit - 1, totalItems)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-2 hover:bg-gray-100 transition-colors">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-2 hover:bg-gray-100 transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all loan disbursements and repayments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search transactions..." 
                    className="pl-8 w-[300px] border-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page on search
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                  />
                </div>
                <Select 
                  value={transactionType}
                  onValueChange={(value) => {
                    setTransactionType(value)
                    setCurrentPage(1) // Reset to first page on filter change
                  }}
                >
                  <SelectTrigger className="w-[180px] border-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="Disbursement">Disbursements</SelectItem>
                    <SelectItem value="Repayment">Repayments</SelectItem>
                    <SelectItem value="Fee">Fees</SelectItem>
                    <SelectItem value="Penalty">Penalties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            <div className="rounded-md border-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-500"></div>
                          <p className="text-sm text-muted-foreground">Loading transactions...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertCircle className="h-8 w-8 text-red-500" />
                          <p className="text-lg font-medium text-red-500">Error loading transactions</p>
                          <p className="text-sm text-muted-foreground">{error}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchTransactions}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.customer}</TableCell>
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
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              transaction.status === "completed" || transaction.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : transaction.status === "failed" || transaction.status === "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/transactions/${transaction.id}`} passHref>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                            >
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-yellow-500 opacity-40" />
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {totalItems > 0 ? (
                  <>
                    Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex + 1}</strong> of <strong>{totalItems}</strong> results
                  </>
                ) : (
                  "No results found"
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages || totalItems === 0 || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

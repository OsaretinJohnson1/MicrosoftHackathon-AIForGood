'use client'
import { useState, useEffect, useRef } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Search, UserPlus, X } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { users } from "@/database/ubuntu-lend/schema"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

// Define interfaces for type safety
interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  userStatus: number;
  delStatus: number;
  activated: number;
  verified: number;
  isAdmin: number;
  signupDate: string;
  [key: string]: any;
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
    [key: string]: any;
  };
}

// Define filter interface
interface FilterOptions {
  status: string | null;
  loanCountMin: number | null;
  loanCountMax: number | null;
  amountMin: number | null;
  amountMax: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

// Add sort interface
interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get initial values
  const getInitialFilters = (): FilterOptions => {
    // Try to get values from URL
    const urlStatus = searchParams.get('status');
    const urlLoanCountMin = searchParams.get('loanCountMin');
    const urlLoanCountMax = searchParams.get('loanCountMax');
    const urlAmountMin = searchParams.get('amountMin');
    const urlAmountMax = searchParams.get('amountMax');
    const urlDateFrom = searchParams.get('dateFrom');
    const urlDateTo = searchParams.get('dateTo');
    
    // Create filter object with URL values
    const filters: FilterOptions = {
      status: urlStatus,
      loanCountMin: urlLoanCountMin ? Number(urlLoanCountMin) : null,
      loanCountMax: urlLoanCountMax ? Number(urlLoanCountMax) : null,
      amountMin: urlAmountMin ? Number(urlAmountMin) : null,
      amountMax: urlAmountMax ? Number(urlAmountMax) : null,
      dateFrom: urlDateFrom ? new Date(urlDateFrom) : null,
      dateTo: urlDateTo ? new Date(urlDateTo) : null
    };
    
    // Fall back to localStorage if URL doesn't have values
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('customersFilters');
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Only use saved values for properties that don't have URL values
          if (!urlStatus && parsedFilters.status) filters.status = parsedFilters.status;
          if (!urlLoanCountMin && parsedFilters.loanCountMin) filters.loanCountMin = parsedFilters.loanCountMin;
          if (!urlLoanCountMax && parsedFilters.loanCountMax) filters.loanCountMax = parsedFilters.loanCountMax;
          if (!urlAmountMin && parsedFilters.amountMin) filters.amountMin = parsedFilters.amountMin;
          if (!urlAmountMax && parsedFilters.amountMax) filters.amountMax = parsedFilters.amountMax;
          if (!urlDateFrom && parsedFilters.dateFrom) filters.dateFrom = new Date(parsedFilters.dateFrom);
          if (!urlDateTo && parsedFilters.dateTo) filters.dateTo = new Date(parsedFilters.dateTo);
        } catch (e) {
          console.error('Error parsing saved filters:', e);
        }
      }
    }
    
    return filters;
  };
  
  const getInitialSearchQuery = () => {
    // Check URL first
    const urlSearch = searchParams.get('q');
    if (urlSearch) return urlSearch;
    
    // Then localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customersSearchQuery');
      return saved || "";
    }
    return "";
  };
  
  const getInitialPage = () => {
    // Check URL first
    const urlPage = searchParams.get('page');
    if (urlPage) return parseInt(urlPage, 10);
    
    // Then localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customersCurrentPage');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  };
  
  const getInitialSortOptions = (): SortOptions => {
    // Check URL first
    const urlSortField = searchParams.get('sortField');
    const urlSortDir = searchParams.get('sortDir');
    
    if (urlSortField && (urlSortDir === 'asc' || urlSortDir === 'desc')) {
      return {
        field: urlSortField,
        direction: urlSortDir
      };
    }
    
    // Then localStorage
    if (typeof window !== 'undefined') {
      const savedSort = localStorage.getItem('customersSortOptions');
      if (savedSort) {
        try {
          return JSON.parse(savedSort);
        } catch (e) {
          // Fall back to default
          return { field: 'signupDate', direction: 'desc' };
        }
      }
    }
    return { field: 'signupDate', direction: 'desc' };
  };
  
  // Initialize state
  const [customers, setCustomers] = useState<UserData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [filters, setFilters] = useState<FilterOptions>(getInitialFilters())
  const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery())
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(getInitialSearchQuery())
  const [sortOptions, setSortOptions] = useState<SortOptions>(getInitialSortOptions())
  
  // Save filter state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customersFilters', JSON.stringify(filters));
    }
  }, [filters]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customersSearchQuery', searchQuery);
    }
  }, [searchQuery]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customersSortOptions', JSON.stringify(sortOptions));
    }
  }, [sortOptions]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customersCurrentPage', currentPage.toString());
    }
  }, [currentPage]);

  // Outside click handler for filter popover
  const filterRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  useEffect(() => {
    // Fetch users data when component mounts or when search/filters/pagination change
    fetchData()
  }, [currentPage, debouncedSearchQuery, filters, sortOptions])

  // Update active filter count
  useEffect(() => {
    let count = 0
    if (filters.status) count++
    if (filters.loanCountMin !== null || filters.loanCountMax !== null) count++
    if (filters.amountMin !== null || filters.amountMax !== null) count++
    if (filters.dateFrom !== null || filters.dateTo !== null) count++
    setActiveFilterCount(count)
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Build query parameters for user search and filtering
      const userQueryParams = new URLSearchParams({
        page: currentPage.toString(),
        sortField: sortOptions.field,
        sortDirection: sortOptions.direction
      })
      
      // Log what we're sending to the API
      console.log('Sending sort parameters to API:', {
        field: sortOptions.field,
        direction: sortOptions.direction
      });
      
      // Use the appropriate endpoint based on what the API supports
      const apiEndpoint = '/api/crud-users/read-user-data';
      
      // Add search parameter if it exists
      if (debouncedSearchQuery.trim()) {
        userQueryParams.append('search', debouncedSearchQuery.trim());
        console.log('Searching for term:', debouncedSearchQuery.trim());
      }
      
      // Add filters to user query params
      if (filters.status) userQueryParams.append('userStatus', filters.status)
      if (filters.loanCountMin !== null) userQueryParams.append('loanCountMin', filters.loanCountMin.toString())
      if (filters.loanCountMax !== null) userQueryParams.append('loanCountMax', filters.loanCountMax.toString())
      if (filters.amountMin !== null) userQueryParams.append('amountMin', filters.amountMin.toString())
      if (filters.amountMax !== null) userQueryParams.append('amountMax', filters.amountMax.toString())
      if (filters.dateFrom !== null) userQueryParams.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo !== null) userQueryParams.append('dateTo', filters.dateTo.toISOString())
      
      console.log(`Fetching users from ${apiEndpoint} with params:`, userQueryParams.toString());
      
      // Fetch user data
      const userResponse = await fetch(`${apiEndpoint}?${userQueryParams.toString()}`);
      const userData = await userResponse.json();
      
      // For debugging
      console.log('User API response:', userData);
      
      if (userData.success) {
        const filteredData = userData.data || [];
        setCustomers(filteredData);
        
        // Set pagination details
        if (userData.pagination) {
          setTotalPages(userData.pagination.totalPages || 1);
          setTotalRecords(userData.pagination.totalCount || 0);
        }
        
        // Fetch transaction data for the current set of users - completely separate request
        if (filteredData.length > 0) {
          const userIds = filteredData.map((user: UserData) => user.id)
          
          // Create completely separate params for transaction request
          const transactionParams = new URLSearchParams()
          transactionParams.append('userIds', userIds.join(','))
          
          console.log('Fetching transactions with params:', transactionParams.toString())
          
          const transactionResponse = await fetch(`/api/crud-users/read-transactions?${transactionParams.toString()}`)
          const transactionData = await transactionResponse.json()
      
      if (transactionData.success) {
        setTransactions(transactionData.data || [])
          } else {
            console.error("Failed to fetch transactions:", transactionData.message)
            setTransactions([])
          }
        } else {
          setTransactions([])
        }
      } else {
        throw new Error(userData.message || "Failed to fetch customers")
      }
      
      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching data")
      setCustomers([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc';
    
    // Create new sort options
    const newSortOptions = {
      field,
      direction: direction as 'asc' | 'desc'
    };
    
    // Update URL with new sort options
    const params = new URLSearchParams(window.location.search);
    params.set('sortField', field);
    params.set('sortDir', direction);
    
    // Reset page when sort changes
    params.set('page', '1');
    
    // Get the current path without query parameters
    const path = window.location.pathname;
    
    // Update the URL without reloading the page
    window.history.pushState({}, '', `${path}?${params.toString()}`);
    
    // Update state
    setSortOptions(newSortOptions);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    // Update URL with new search
    const params = new URLSearchParams(window.location.search);
    
    if (query.trim() === '') {
      params.delete('q');
    } else {
      params.set('q', query.trim());
    }
    
    // Reset page when search changes
    params.set('page', '1');
    
    // Get the current path without query parameters
    const path = window.location.pathname;
    
    // Update the URL without reloading the page
    window.history.pushState({}, '', `${path}?${params.toString()}`);
    
    // Update state
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    // Reset filters
    setFilters({
      status: null,
      loanCountMin: null,
      loanCountMax: null,
      amountMin: null,
      amountMax: null,
      dateFrom: null,
      dateTo: null
    });
    
    // Reset to first page
    setCurrentPage(1);
    
    // Update URL to remove all filter parameters
    const params = new URLSearchParams(window.location.search);
    params.delete('status');
    params.delete('loanCountMin');
    params.delete('loanCountMax');
    params.delete('amountMin');
    params.delete('amountMax');
    params.delete('dateFrom');
    params.delete('dateTo');
    params.set('page', '1');
    
    const path = window.location.pathname;
    window.history.pushState({}, '', `${path}?${params.toString()}`);
  };

  // Add a function to handle refresh that resets filters and search
  const handleRefresh = () => {
    // Reset search
    setSearchQuery("");
    setDebouncedSearchQuery("");
    
    // Reset filters
    setFilters({
      status: null,
      loanCountMin: null,
      loanCountMax: null,
      amountMin: null,
      amountMax: null,
      dateFrom: null,
      dateTo: null
    });
    
    // Reset sorting to default
    setSortOptions({
      field: 'signupDate',
      direction: 'desc'
    });
    
    // Reset to first page
    setCurrentPage(1);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customersFilters');
      localStorage.removeItem('customersSearchQuery');
      localStorage.removeItem('customersSortOptions');
      localStorage.removeItem('customersCurrentPage');
    }
    
    // Clear URL parameters
    const path = window.location.pathname;
    window.history.pushState({}, '', path);
    
    // Fetch fresh data
    fetchData();
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`)
  }
  
  const handleAddCustomer = () => {
    router.push('/dashboard/customers/new')
  }

  // Calculate loan data for a specific user
  const getUserLoanData = (userId: number) => {
    // Filter transactions for this user
    const userTransactions = transactions.filter(t => t.raw.userId === userId)
    
    // Get unique loan applications (based on applicationId)
    const uniqueLoans = new Set(userTransactions.filter(t => t.type === 'Disbursement').map(t => t.raw.applicationId))
    
    // Calculate total loan amount (from disbursements)
    const totalAmount = userTransactions
      .filter(t => t.type === 'Disbursement')
      .reduce((sum, t) => {
        // Extract numeric value from amount string (e.g., "$5,000" -> 5000)
        const amount = parseFloat(t.amount.replace(/[$,]/g, '')) || 0
        return sum + amount
      }, 0)
    
    return {
      loanCount: uniqueLoans.size,
      totalAmount
    }
  }

  // Format user data to match the expected format for the table
  const formatUserData = (user: UserData) => {
    const fullName = `${user.firstname} ${user.lastname}`
    
    // ONLY use delStatus for status display as requested by user
    // delStatus: 1 = deleted/inactive, 0 = active
    const status = user.delStatus === 1 ? "Inactive" : "Active";
    
    // Get loan data for this user
    const { loanCount, totalAmount } = getUserLoanData(user.id)
    
    // Format join date to be more meaningful (like in applications page)
    let formattedDate = "N/A"
    if (user.signupDate) {
      const date = new Date(user.signupDate)
      // Format: Month Day, Year (e.g., "January 1, 2023")
      formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return {
      id: `CUST-${user.id.toString().padStart(4, '0')}`,
      name: fullName,
      email: user.email,
      phone: user.phone || "N/A",
      loans: loanCount,
      totalAmount: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: user.delStatus === 1 ? "Inactive" : "Active",
      joinDate: formattedDate,
    }
  }

  // Process customers data for display
  const formattedCustomers = customers.map(formatUserData)
  
  // Update apply filter to use URL parameters
  const applyFilter = (filterType: keyof FilterOptions, value: any) => {
    // Update the filter state
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Reset to first page
    setCurrentPage(1);
    
    // Update URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Handle different filter types
    if (value === null) {
      params.delete(filterType);
    } else if (filterType === 'dateFrom' || filterType === 'dateTo') {
      // Convert Date to ISO string for URL
      params.set(filterType, value.toISOString());
    } else {
      params.set(filterType, value.toString());
    }
    
    // Reset page to 1 when filter changes
    params.set('page', '1');
    
    // Update URL without reloading the page
    const path = window.location.pathname;
    window.history.pushState({}, '', `${path}?${params.toString()}`);
  };
  
  // Update remove filter to use URL parameters
  const removeFilter = (filterType: keyof FilterOptions | string) => {
    const params = new URLSearchParams(window.location.search);
    
    if (filterType === "loanCount") {
      setFilters(prev => ({
        ...prev,
        loanCountMin: null,
        loanCountMax: null
      }));
      params.delete('loanCountMin');
      params.delete('loanCountMax');
    } else if (filterType === "amount") {
      setFilters(prev => ({
        ...prev,
        amountMin: null,
        amountMax: null
      }));
      params.delete('amountMin');
      params.delete('amountMax');
    } else if (filterType === "date") {
      setFilters(prev => ({
        ...prev,
        dateFrom: null,
        dateTo: null
      }));
      params.delete('dateFrom');
      params.delete('dateTo');
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: null
      }));
      params.delete(filterType as string);
  }

    // Reset to page 1 when filter is removed
    setCurrentPage(1);
    params.set('page', '1');
    
    // Update URL without reloading
    const path = window.location.pathname;
    window.history.pushState({}, '', `${path}?${params.toString()}`);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Log detailed information about the state before changing page
    console.log(`Changing from page ${currentPage} to ${page}`);
    
    // Update the URL to reflect current state
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    // Get the current path without query parameters
    const path = window.location.pathname;
    
    // Update the URL without reloading the page
    window.history.pushState({}, '', `${path}?${params.toString()}`);
    
    // Update the state
    setCurrentPage(page);
  };

  // Update URL when filters, sorting, or pagination change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    
    // Update search params
    updateURLParam(params, 'page', currentPage.toString());
    updateURLParam(params, 'sortField', sortOptions.field);
    updateURLParam(params, 'sortDirection', sortOptions.direction);
    
    // Update filter params
    updateURLParam(params, 'search', debouncedSearchQuery);
    updateURLParam(params, 'status', filters.status);
    
    if (filters.loanCountMin !== null) updateURLParam(params, 'loanCountMin', filters.loanCountMin.toString());
    else params.delete('loanCountMin');
    
    if (filters.loanCountMax !== null) updateURLParam(params, 'loanCountMax', filters.loanCountMax.toString());
    else params.delete('loanCountMax');
    
    if (filters.amountMin !== null) updateURLParam(params, 'amountMin', filters.amountMin.toString());
    else params.delete('amountMin');
    
    if (filters.amountMax !== null) updateURLParam(params, 'amountMax', filters.amountMax.toString());
    else params.delete('amountMax');
    
    if (filters.dateFrom !== null) updateURLParam(params, 'dateFrom', filters.dateFrom.toISOString());
    else params.delete('dateFrom');
    
    if (filters.dateTo !== null) updateURLParam(params, 'dateTo', filters.dateTo.toISOString());
    else params.delete('dateTo');
    
    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
    
    // Save current state to localStorage for persistence
    localStorage.setItem('customerFilters', JSON.stringify(filters));
    localStorage.setItem('customerSortOptions', JSON.stringify(sortOptions));
    localStorage.setItem('customerSearchQuery', searchQuery);
  }, [filters, sortOptions, currentPage, debouncedSearchQuery, searchQuery]);
  
  // Helper function to update URL parameters
  const updateURLParam = (params: URLSearchParams, key: string, value: string | null) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      loanCountMin: null,
      loanCountMax: null,
      amountMin: null,
      amountMax: null,
      dateFrom: null,
      dateTo: null
    });
    setSearchQuery('');
    
    // Clear URL parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({ path: url.toString() }, '', url.toString());
      
      // Clear localStorage
      localStorage.removeItem('customerFilters');
      localStorage.removeItem('customerSortOptions');
      localStorage.removeItem('customerSearchQuery');
    }
    
    // Show success message
    toast.success("Filters Reset", {
      description: "All filters have been cleared."
    });
    
    // Reset to first page
    setCurrentPage(1);
  };

  const applyFilters = () => {
    // This will trigger the useEffect to refetch data
    setCurrentPage(1);
    
    // Count active filters for notification
    let activeFilterCount = 0;
    if (filters.status) activeFilterCount++;
    if (filters.loanCountMin !== null) activeFilterCount++;
    if (filters.loanCountMax !== null) activeFilterCount++;
    if (filters.amountMin !== null) activeFilterCount++;
    if (filters.amountMax !== null) activeFilterCount++;
    if (filters.dateFrom !== null) activeFilterCount++;
    if (filters.dateTo !== null) activeFilterCount++;
    if (searchQuery.trim()) activeFilterCount++;
    
    // Show success message
    toast.success("Filters Applied", {
      description: `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} applied. Showing filtered results.`
    });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Customers</h2>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border border-gray-200 hover:bg-gray-50/80 transition-all duration-200 rounded-lg px-4">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => applyFilter("status", "Active")}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Active
                    {filters.status === "Active" && <span className="ml-auto">✓</span>}
                </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFilter("status", "Inactive")}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                    Inactive
                    {filters.status === "Inactive" && <span className="ml-auto">✓</span>}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFilter("status", "Deleted")}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Deleted
                    {filters.status === "Deleted" && <span className="ml-auto">✓</span>}
                </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleSortChange('signupDate')}>
                  Latest First
                  {sortOptions.field === 'signupDate' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOptions({field: 'signupDate', direction: 'asc'})
                  setCurrentPage(1)
                }}>
                  Oldest First
                  {sortOptions.field === 'signupDate' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOptions({field: 'name', direction: 'asc'})
                  setCurrentPage(1)
                }}>
                  Name (A-Z)
                  {sortOptions.field === 'name' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOptions({field: 'name', direction: 'desc'})
                  setCurrentPage(1)
                }}>
                  Name (Z-A)
                  {sortOptions.field === 'name' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearAllFilters} className="text-red-500 hover:text-red-600 font-medium">
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="border border-gray-200 hover:bg-gray-50/80 transition-all duration-200 rounded-lg px-4">
            <Download className="mr-2 h-4 w-4 text-gray-500" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg rounded-lg px-4"
            onClick={handleAddCustomer}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-xl font-semibold text-gray-800">Customer Management</CardTitle>
            <CardDescription className="text-gray-500">View and manage your customer database</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search customers..." 
                    className="pl-10 w-[320px] border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all" 
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      // Submit search on Enter key
                      if (e.key === 'Enter') {
                        // Ensure debounced search happens immediately
                        setDebouncedSearchQuery(searchQuery);
                      }
                    }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
              </div>
              
              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.status && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 py-1">
                      Status: {filters.status}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => removeFilter("status")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {(filters.loanCountMin !== null || filters.loanCountMax !== null) && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 py-1">
                      Loans: {filters.loanCountMin ?? "0"} - {filters.loanCountMax ?? "∞"}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => removeFilter("loanCount")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {(filters.amountMin !== null || filters.amountMax !== null) && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 py-1">
                      Amount: ${filters.amountMin ?? "0"} - ${filters.amountMax ?? "∞"}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => removeFilter("amount")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {(filters.dateFrom !== null || filters.dateTo !== null) && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 py-1">
                      Date: {filters.dateFrom?.toLocaleDateString() ?? "Any"} - {filters.dateTo?.toLocaleDateString() ?? "Any"}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => removeFilter("date")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Quick status filter buttons */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filters.status === "Active" ? "default" : "outline"} 
                  size="sm" 
                  className={filters.status === "Active" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}
                  onClick={() => applyFilter("status", filters.status === "Active" ? null : "Active")}
                >
                  <span className={`w-2 h-2 rounded-full ${filters.status === "Active" ? "bg-white" : "bg-emerald-500"} mr-2`}></span>
                  Active
                </Button>
                <Button 
                  variant={filters.status === "Inactive" ? "default" : "outline"} 
                  size="sm" 
                  className={filters.status === "Inactive" ? "bg-gray-600 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                  onClick={() => applyFilter("status", filters.status === "Inactive" ? null : "Inactive")}
                >
                  <span className={`w-2 h-2 rounded-full ${filters.status === "Inactive" ? "bg-white" : "bg-gray-400"} mr-2`}></span>
                  Inactive
                </Button>
                <Button 
                  variant={filters.status === "Deleted" ? "default" : "outline"} 
                  size="sm" 
                  className={filters.status === "Deleted" ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-700 hover:bg-red-50"}
                  onClick={() => applyFilter("status", filters.status === "Deleted" ? null : "Deleted")}
                >
                  <span className={`w-2 h-2 rounded-full ${filters.status === "Deleted" ? "bg-white" : "bg-red-500"} mr-2`}></span>
                  Deleted
                </Button>

                <div className="mx-2 border-l border-gray-200 h-6"></div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort by: {sortOptions.field === 'signupDate' ? 'Date' : 
                               sortOptions.field === 'name' ? 'Name' : 
                               sortOptions.field}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortOptions({field: 'signupDate', direction: 'desc'})}>
                      Latest First
                      {sortOptions.field === 'signupDate' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOptions({field: 'signupDate', direction: 'asc'})}>
                      Oldest First
                      {sortOptions.field === 'signupDate' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOptions({field: 'name', direction: 'asc'})}>
                      Name (A-Z)
                      {sortOptions.field === 'name' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOptions({field: 'name', direction: 'desc'})}>
                      Name (Z-A)
                      {sortOptions.field === 'name' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('id')}>
                        Customer ID
                        {sortOptions.field === 'id' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('name')}>
                        Name
                        {sortOptions.field === 'name' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('email')}>
                        Email
                        {sortOptions.field === 'email' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('phone')}>
                        Phone
                        {sortOptions.field === 'phone' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('loanCount')}>
                        Loans
                        {sortOptions.field === 'loanCount' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('totalAmount')}>
                        Total Amount
                        {sortOptions.field === 'totalAmount' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('status')}>
                        Status
                        {sortOptions.field === 'status' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('signupDate')}>
                        Join Date
                        {sortOptions.field === 'signupDate' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-500"></div>
                          <p className="text-sm text-muted-foreground">Loading customers...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <p className="text-lg font-medium text-red-500">Error loading customers</p>
                          <p className="text-sm text-muted-foreground">{error}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={fetchData}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : formattedCustomers.length > 0 ? (
                    formattedCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">{customer.id}</TableCell>
                        <TableCell className="font-medium text-gray-800">{customer.name}</TableCell>
                        <TableCell className="text-gray-600">{customer.email}</TableCell>
                        <TableCell className="text-gray-600">{customer.phone}</TableCell>
                        <TableCell className="font-medium">{customer.loans}</TableCell>
                        <TableCell className="font-medium">{customer.totalAmount}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              customer.status === "Active" ? "bg-emerald-100 text-emerald-800" : 
                              customer.status === "Deleted" ? "bg-red-100 text-red-800" : 
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {customer.status === "Active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            )}
                            {customer.status === "Inactive" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                            )}
                            {customer.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{customer.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-lg font-medium transition-colors"
                            onClick={() => handleViewCustomer(customer.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-yellow-500 opacity-40" />
                          <p className="text-lg font-medium">No customers found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try adjusting your search query" : "Add a new customer to get started"}
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
                Showing <strong>{formattedCustomers.length}</strong> of <strong>{totalRecords}</strong> customers
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="mx-2 text-sm">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
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

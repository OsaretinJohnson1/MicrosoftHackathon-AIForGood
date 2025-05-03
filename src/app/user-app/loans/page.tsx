"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, ChevronRight, Plus, Clock, CheckCircle, XCircle, DollarSign, Calendar, Briefcase, Search, ArrowUpRight, ChevronLeft, Download, Filter, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import React from "react"
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuGroup, 
	DropdownMenuItem, 
	DropdownMenuLabel, 
	DropdownMenuSeparator, 
	DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { 
	Popover, 
	PopoverContent, 
	PopoverTrigger 
} from "@/components/ui/popover"
import { toast } from "sonner"

// Type for application data
interface Application {
	application: {
		id: number
		userId: number
		loanAmount: string
		loanTermMonths: number
		interestRate: string
		purpose: string
		status: string
		applicationDate: string
		totalPayable: string
		monthlyPayment: string
		loanTypeId: number
		employer: string
		isDisbursed: number
		disbursementDate: string | null
		isOverdue: number
		overdueAmount: string | null
		overdueDate: string | null
	}
	loanType: {
		name: string
		description: string
	}
}

// Type for pagination data
interface PaginationData {
	currentPage: number
	totalPages: number
	totalCount: number
}

// Type for filter options
interface FilterOptions {
	status: string | null
	amountMin: number | null
	amountMax: number | null
	dateFrom: Date | null
	dateTo: Date | null
	purpose: string | null
	term: number | null
}

// Type for sort options
interface SortOptions {
	field: string
	direction: 'asc' | 'desc'
}

export default function LoansPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	
	const [applications, setApplications] = useState<Application[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState(getInitialSearchQuery())
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(getInitialSearchQuery())
	const [statusFilter, setStatusFilter] = useState("all")
	const [pagination, setPagination] = useState<PaginationData>({
		currentPage: getInitialPage(),
		totalPages: 0,
		totalCount: 0
	})
	const [filters, setFilters] = useState<FilterOptions>(getInitialFilters())
	const [sortOptions, setSortOptions] = useState<SortOptions>(getInitialSortOptions())
	const [activeFilterCount, setActiveFilterCount] = useState(0)
	const [showFilters, setShowFilters] = useState(false)

	// Functions to get initial values from URL or localStorage
	function getInitialSearchQuery() {
		// Check URL first
		const urlSearch = searchParams.get('q')
		if (urlSearch) return urlSearch
		
		// Then localStorage
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('loansSearchQuery')
			return saved || ""
		}
		return ""
	}
	
	function getInitialPage() {
		// Check URL first
		const urlPage = searchParams.get('page')
		if (urlPage) return parseInt(urlPage, 10)
		
		// Then localStorage
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('loansCurrentPage')
			return saved ? parseInt(saved, 10) : 1
		}
		return 1
	}
	
	function getInitialFilters(): FilterOptions {
		// Try to get values from URL
		const urlStatus = searchParams.get('status')
		const urlAmountMin = searchParams.get('amountMin')
		const urlAmountMax = searchParams.get('amountMax')
		const urlDateFrom = searchParams.get('dateFrom')
		const urlDateTo = searchParams.get('dateTo')
		const urlPurpose = searchParams.get('purpose')
		const urlTerm = searchParams.get('term')
		
		// Create filter object with URL values
		const filters: FilterOptions = {
			status: urlStatus,
			amountMin: urlAmountMin ? Number(urlAmountMin) : null,
			amountMax: urlAmountMax ? Number(urlAmountMax) : null,
			dateFrom: urlDateFrom ? new Date(urlDateFrom) : null,
			dateTo: urlDateTo ? new Date(urlDateTo) : null,
			purpose: urlPurpose,
			term: urlTerm ? Number(urlTerm) : null
		}
		
		// Fall back to localStorage if URL doesn't have values
		if (typeof window !== 'undefined') {
			const savedFilters = localStorage.getItem('loansFilters')
			if (savedFilters) {
				try {
					const parsedFilters = JSON.parse(savedFilters)
					
					// Only use saved values for properties that don't have URL values
					if (!urlStatus && parsedFilters.status) filters.status = parsedFilters.status
					if (!urlAmountMin && parsedFilters.amountMin) filters.amountMin = parsedFilters.amountMin
					if (!urlAmountMax && parsedFilters.amountMax) filters.amountMax = parsedFilters.amountMax
					if (!urlDateFrom && parsedFilters.dateFrom) filters.dateFrom = new Date(parsedFilters.dateFrom)
					if (!urlDateTo && parsedFilters.dateTo) filters.dateTo = new Date(parsedFilters.dateTo)
					if (!urlPurpose && parsedFilters.purpose) filters.purpose = parsedFilters.purpose
					if (!urlTerm && parsedFilters.term) filters.term = parsedFilters.term
				} catch (e) {
					console.error('Error parsing saved filters:', e)
				}
			}
		}
		
		return filters
	}
	
	function getInitialSortOptions(): SortOptions {
		// Check URL first
		const urlSortField = searchParams.get('sortField')
		const urlSortDir = searchParams.get('sortDir')
		
		if (urlSortField && (urlSortDir === 'asc' || urlSortDir === 'desc')) {
			return {
				field: urlSortField,
				direction: urlSortDir
			}
		}
		
		// Then localStorage
		if (typeof window !== 'undefined') {
			const savedSort = localStorage.getItem('loansSortOptions')
			if (savedSort) {
				try {
					return JSON.parse(savedSort)
				} catch (e) {
					// Fall back to default
					return { field: 'applicationDate', direction: 'desc' }
				}
			}
		}
		return { field: 'applicationDate', direction: 'desc' }
	}

	// Load data when session is available
	useEffect(() => {
		if (status === "authenticated" && session?.user?.id) {
			fetchApplications(pagination.currentPage)
		} else if (status === "unauthenticated") {
			router.push("/auth/login")
		}
	}, [status, session, router, pagination.currentPage, debouncedSearchTerm, filters, sortOptions])

	// Fetch user applications
	const fetchApplications = async (pageNumber: number = 1) => {
		setLoading(true)
		try {
			// Build query parameters
			const queryParams = new URLSearchParams({
				page: pageNumber.toString(),
				limit: '4',
				sortField: sortOptions.field,
				sortDirection: sortOptions.direction
			})
			
			// Add search parameter if it exists
			if (debouncedSearchTerm.trim()) {
				queryParams.append('search', debouncedSearchTerm.trim())
			}
			
			// Add filters
			if (filters.status) queryParams.append('status', filters.status)
			if (filters.amountMin !== null) queryParams.append('amountMin', filters.amountMin.toString())
			if (filters.amountMax !== null) queryParams.append('amountMax', filters.amountMax.toString())
			if (filters.dateFrom !== null) queryParams.append('dateFrom', filters.dateFrom.toISOString())
			if (filters.dateTo !== null) queryParams.append('dateTo', filters.dateTo.toISOString())
			if (filters.purpose) queryParams.append('purpose', filters.purpose)
			if (filters.term !== null) queryParams.append('term', filters.term.toString())

			const response = await fetch(`/api/crud-users/read-user-applications?${queryParams.toString()}`)
			const data = await response.json()

			if (data.success) {
				setApplications(data.data)
				setPagination({
					currentPage: data.pagination.page,
					totalPages: data.pagination.totalPages,
					totalCount: data.pagination.totalCount
				})
			} else {
				console.error("Error fetching applications:", data.message)
				setError("Failed to load applications")
			}
		} catch (error) {
			console.error("Error fetching applications:", error)
			setError("Failed to load applications")
		} finally {
			setLoading(false)
		}
	}

	// Handle page change
	const handlePageChange = (newPage: number) => {
		// Update URL to reflect page change
		const params = new URLSearchParams(window.location.search)
		params.set('page', newPage.toString())
		
		// Get the current path without query parameters
		const path = window.location.pathname
		
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${path}?${params.toString()}`)
		
		// Update state
		setPagination(prev => ({
			...prev,
			currentPage: newPage
		}))
	}

	// Handle search change
	const handleSearchChange = (query: string) => {
		// Update URL with new search
		const params = new URLSearchParams(window.location.search)
		
		if (query.trim() === '') {
			params.delete('q')
		} else {
			params.set('q', query.trim())
		}
		
		// Reset page when search changes
		params.set('page', '1')
		
		// Get the current path without query parameters
		const path = window.location.pathname
		
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${path}?${params.toString()}`)
		
		// Update state
		setSearchTerm(query)
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
	}

	// Handle sort change
	const handleSortChange = (field: string) => {
		const direction = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc'
		
		// Update URL with new sort options
		const params = new URLSearchParams(window.location.search)
		params.set('sortField', field)
		params.set('sortDir', direction)
		
		// Reset page when sort changes
		params.set('page', '1')
		
		// Get the current path without query parameters
		const path = window.location.pathname
		
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${path}?${params.toString()}`)
		
		// Update state
		setSortOptions({
			field,
			direction: direction as 'asc' | 'desc'
		})
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
	}

	// Apply filter
	const applyFilter = (filterType: keyof FilterOptions, value: any) => {
		// Update the filter state
		setFilters(prev => ({
			...prev,
			[filterType]: value
		}))
		
		// Reset to first page
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
		
		// Update URL parameters
		const params = new URLSearchParams(window.location.search)
		
		// Handle different filter types
		if (value === null) {
			params.delete(filterType)
		} else if (filterType === 'dateFrom' || filterType === 'dateTo') {
			// Convert Date to ISO string for URL
			params.set(filterType, value.toISOString())
		} else {
			params.set(filterType, value.toString())
		}
		
		// Reset page to 1 when filter changes
		params.set('page', '1')
		
		// Update URL without reloading the page
		const path = window.location.pathname
		window.history.pushState({}, '', `${path}?${params.toString()}`)
	}

	// Remove filter
	const removeFilter = (filterType: keyof FilterOptions | string) => {
		const params = new URLSearchParams(window.location.search)
		
		if (filterType === "amount") {
			setFilters(prev => ({
				...prev,
				amountMin: null,
				amountMax: null
			}))
			params.delete('amountMin')
			params.delete('amountMax')
		} else if (filterType === "date") {
			setFilters(prev => ({
				...prev,
				dateFrom: null,
				dateTo: null
			}))
			params.delete('dateFrom')
			params.delete('dateTo')
		} else {
			setFilters(prev => ({
				...prev,
				[filterType]: null
			}))
			params.delete(filterType as string)
		}
		
		// Reset to page 1 when filter is removed
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
		params.set('page', '1')
		
		// Update URL without reloading
		const path = window.location.pathname
		window.history.pushState({}, '', `${path}?${params.toString()}`)
	}

	// Clear all filters
	const clearAllFilters = () => {
		// Reset filters
		setFilters({
			status: null,
			amountMin: null,
			amountMax: null,
			dateFrom: null,
			dateTo: null,
			purpose: null,
			term: null
		})
		
		// Reset to first page
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
		
		// Update URL to remove all filter parameters
		const params = new URLSearchParams(window.location.search)
		params.delete('status')
		params.delete('amountMin')
		params.delete('amountMax')
		params.delete('dateFrom')
		params.delete('dateTo')
		params.delete('purpose')
		params.delete('term')
		params.set('page', '1')
		
		const path = window.location.pathname
		window.history.pushState({}, '', `${path}?${params.toString()}`)
	}

	// Handle refresh
	const handleRefresh = () => {
		// Reset search
		setSearchTerm("")
		setDebouncedSearchTerm("")
		
		// Reset filters
		setFilters({
			status: null,
			amountMin: null,
			amountMax: null,
			dateFrom: null,
			dateTo: null,
			purpose: null,
			term: null
		})
		
		// Reset sorting to default
		setSortOptions({
			field: 'applicationDate',
			direction: 'desc'
		})
		
		// Reset to first page
		setPagination(prev => ({
			...prev,
			currentPage: 1
		}))
		
		// Clear localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('loansFilters')
			localStorage.removeItem('loansSearchQuery')
			localStorage.removeItem('loansSortOptions')
			localStorage.removeItem('loansCurrentPage')
		}
		
		// Clear URL parameters
		const path = window.location.pathname
		window.history.pushState({}, '', path)
		
		// Fetch fresh data
		fetchApplications(1)
	}

	// Get status badge styles
	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case "approved":
				return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
			case "pending":
				return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
			case "processing":
				return <Badge className="bg-blue-400 hover:bg-blue-500">Processing</Badge>
			case "rejected":
				return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
			case "disbursed":
				return <Badge className="bg-blue-500 hover:bg-blue-600">Disbursed</Badge>
			case "completed":
				return <Badge className="bg-green-700 hover:bg-green-800">Completed</Badge>
			case "defaulted":
				return <Badge className="bg-red-700 hover:bg-red-800">Defaulted</Badge>
			default:
				return <Badge>{status}</Badge>
		}
	}

	// Format currency
	const formatCurrency = (amount: string | number | null) => {
		if (amount === null) return "R0.00"
		return new Intl.NumberFormat("en-ZA", {
			style: "currency",
			currency: "ZAR",
			minimumFractionDigits: 2
		}).format(Number(amount))
	}

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A"
		return new Date(dateString).toLocaleDateString("en-ZA", {
			year: "numeric",
			month: "long",
			day: "numeric"
		})
	}

	// Calculate loan progress
	const calculateProgress = (application: Application['application']) => {
		if (application.status.toLowerCase() !== 'disbursed' &&
			application.status.toLowerCase() !== 'completed') {
			return 0
		}

		// Simple calculation just for display purposes
		// In a real app, this would use actual payment data
		const progress = application.isDisbursed ? 25 : 0
		return progress
	}

	// Save filter state to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('loansFilters', JSON.stringify(filters))
		}
	}, [filters])
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('loansSearchQuery', searchTerm)
		}
	}, [searchTerm])
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('loansSortOptions', JSON.stringify(sortOptions))
		}
	}, [sortOptions])
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('loansCurrentPage', pagination.currentPage.toString())
		}
	}, [pagination.currentPage])
	
	// Debounce search term
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm)
		}, 300)
		
		return () => {
			clearTimeout(handler)
		}
	}, [searchTerm])
	
	// Update active filter count
	useEffect(() => {
		let count = 0
		if (filters.status) count++
		if (filters.amountMin !== null || filters.amountMax !== null) count++
		if (filters.dateFrom !== null || filters.dateTo !== null) count++
		if (filters.purpose) count++
		if (filters.term !== null) count++
		setActiveFilterCount(count)
	}, [filters])

	// Filter applications based on search and filters
	const filteredApplications = applications.filter(app => {
		// Convert loan amount to number for comparison
		const loanAmount = parseFloat(app.application.loanAmount) || 0
		
		// Search term filter - search in loan type, ID, etc.
		const matchesSearch = 
			app.loanType.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
			`LOAN-${app.application.id.toString().padStart(3, '0')}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
			app.application.purpose.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
			
		// Status filter
		const matchesStatus = 
			!filters.status || 
			app.application.status.toLowerCase() === filters.status.toLowerCase()
			
		// Amount filter
		const matchesAmount = 
			(filters.amountMin === null || loanAmount >= filters.amountMin) &&
			(filters.amountMax === null || loanAmount <= filters.amountMax)
			
		// Date filter
		const appDate = new Date(app.application.applicationDate)
		const matchesDate = 
			(filters.dateFrom === null || appDate >= filters.dateFrom) &&
			(filters.dateTo === null || appDate <= filters.dateTo)
			
		// Purpose filter
		const matchesPurpose = 
			!filters.purpose || 
			app.application.purpose.toLowerCase().includes(filters.purpose.toLowerCase())
			
		// Term filter
		const matchesTerm = 
			filters.term === null || 
			app.application.loanTermMonths === filters.term
			
		return matchesSearch && matchesStatus && matchesAmount && matchesDate && matchesPurpose && matchesTerm
	})

	if (loading && applications.length === 0) {
		return (
			<div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
					<p className="text-lg text-muted-foreground">Loading your loan applications...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">My Loans</h1>
				<div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => applyFilter("status", "pending")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                        Pending
                                        {filters.status === "pending" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "approved")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        Approved
                                        {filters.status === "approved" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "rejected")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                        Rejected
                                        {filters.status === "rejected" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "disbursed")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                        Disbursed
                                        {filters.status === "disbursed" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "completed")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-700 mr-2"></span>
                                        Completed
                                        {filters.status === "completed" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => handleSortChange('applicationDate')}>
                                    Latest First
                                    {sortOptions.field === 'applicationDate' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('applicationDate')}>
                                    Oldest First
                                    {sortOptions.field === 'applicationDate' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('loanAmount')}>
                                    Amount (High to Low)
                                    {sortOptions.field === 'loanAmount' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('loanAmount')}>
                                    Amount (Low to High)
                                    {sortOptions.field === 'loanAmount' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            {activeFilterCount > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearAllFilters} className="text-red-500 hover:text-red-600 focus:text-red-500">
                                        Clear All Filters
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
					
				<Button onClick={() => router.push("/user-app/applications/new")} className="gap-2">
					<Plus size={16} />
					Apply for a Loan
				</Button>
			</div>
			</div>

			{/* Search and filter */}
			<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
				<div className="relative w-full md:w-auto">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search loans..."
						className="pl-8 w-full md:w-[300px] rounded-full"
						value={searchTerm}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</div>
				<Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
                
                {/* Display active filters */}
                {activeFilterCount > 0 && (
                    <div className="flex-1 flex flex-wrap gap-2 justify-end">
                        {filters.status && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
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
                        
                        {(filters.amountMin !== null || filters.amountMax !== null) && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Amount: {filters.amountMin ? formatCurrency(filters.amountMin) : "R0"} - {filters.amountMax ? formatCurrency(filters.amountMax) : "Any"}
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
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Date: {filters.dateFrom?.toLocaleDateString() || "Any"} - {filters.dateTo?.toLocaleDateString() || "Any"}
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
                        
                        {filters.purpose && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Purpose: {filters.purpose}
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-4 w-4 p-0 ml-1" 
                                    onClick={() => removeFilter("purpose")}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        
                        {filters.term !== null && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Term: {filters.term} months
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-4 w-4 p-0 ml-1" 
                                    onClick={() => removeFilter("term")}
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
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={filters.status === "pending" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "pending" ? null : "pending")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "pending" ? "bg-white" : "bg-yellow-500"} mr-2`}></span>
                        Pending
                    </Button>
                    <Button 
                        variant={filters.status === "approved" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "approved" ? null : "approved")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "approved" ? "bg-white" : "bg-green-500"} mr-2`}></span>
                        Approved
                    </Button>
                    <Button 
                        variant={filters.status === "rejected" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "rejected" ? null : "rejected")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "rejected" ? "bg-white" : "bg-red-500"} mr-2`}></span>
                        Rejected
                    </Button>
                    <Button 
                        variant={filters.status === "disbursed" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "disbursed" ? "bg-blue-500 hover:bg-blue-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "disbursed" ? null : "disbursed")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "disbursed" ? "bg-white" : "bg-blue-500"} mr-2`}></span>
                        Disbursed
                    </Button>
                    <Button 
                        variant={filters.status === "completed" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "completed" ? "bg-green-700 hover:bg-green-800" : ""}
                        onClick={() => applyFilter("status", filters.status === "completed" ? null : "completed")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "completed" ? "bg-white" : "bg-green-700"} mr-2`}></span>
                        Completed
                    </Button>
                </div>
			</div>

			{applications.length === 0 && !loading ? (
				<Card className="mb-6 bg-muted/40">
					<CardContent className="pt-6 text-center">
						<div className="mb-4">
							<AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
						</div>
						<h3 className="text-xl font-medium mb-2">No loan applications yet</h3>
						<p className="text-muted-foreground mb-4">
							You haven't applied for any loans yet. Get started by applying for your first loan.
						</p>
						<Button onClick={() => router.push("/user-app/loans/new")}>Apply Now</Button>
					</CardContent>
				</Card>
			) : filteredApplications.length === 0 && !loading ? (
				<Card className="mb-6 bg-muted/40">
					<CardContent className="pt-6 text-center">
						<div className="mb-4">
							<Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
						</div>
						<h3 className="text-xl font-medium mb-2">No results found</h3>
						<p className="text-muted-foreground mb-4">
							{debouncedSearchTerm ? 
								`No loans match your search "${debouncedSearchTerm}".` : 
								"No loans match your current filters."}
						</p>
						<div className="flex gap-3 justify-center">
							{(debouncedSearchTerm || activeFilterCount > 0) && (
								<Button variant="outline" onClick={handleRefresh}>Clear All Filters</Button>
							)}
							<Button onClick={() => router.push("/user-app/applications/new")}>Apply For a New Loan</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
						{filteredApplications.map((app) => (
							<Card key={app.application.id} className="card-hover">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">{app.loanType.name || "Personal Loan"}</CardTitle>
										{getStatusBadge(app.application.status)}
									</div>
									<CardDescription>Loan ID: {app.application.id}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Original Amount</p>
											<p className="text-lg font-semibold">{formatCurrency(app.application.loanAmount)}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Interest Rate</p>
											<p className="text-lg font-semibold">{app.application.interestRate}%</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Term</p>
											<p className="text-lg font-semibold">{app.application.loanTermMonths} months</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Purpose</p>
											<p className="text-lg font-semibold">{app.application.purpose || "Not specified"}</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span>Repayment Progress</span>
											<span className="font-medium">{calculateProgress(app.application)}%</span>
										</div>
										<Progress
											value={calculateProgress(app.application)}
											className="h-2 bg-secondary relative"
										/>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Monthly Payment</p>
											<p className="font-medium">{formatCurrency(app.application.monthlyPayment)}</p>
										</div>
										<Button size="sm" asChild>
											<Link href={`/user-app/loans/${app.application.id}`}>View Details</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Pagination Controls */}
					{applications.length > 0 && (
						<div className="mt-6 flex justify-between items-center">
							<p className="text-sm text-gray-500">
								Showing {(pagination.currentPage - 1) * 4 + 1} to {Math.min(pagination.currentPage * 4, pagination.totalCount)} of {pagination.totalCount} loans
							</p>
							<div className="flex space-x-2">
								<Button 
									variant="outline" 
									size="sm" 
									onClick={() => handlePageChange(pagination.currentPage - 1)}
									disabled={pagination.currentPage <= 1}
								>
									<ChevronLeft className="h-4 w-4 mr-1" /> Previous
								</Button>
								{Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
									.filter(page => 
										// Show current page
										page === pagination.currentPage ||
										// Show first and last page
										page === 1 || page === pagination.totalPages ||
										// Show pages adjacent to current page
										Math.abs(page - pagination.currentPage) <= 1)
									.map((page, idx, arr) => {
										// Add ellipsis where needed
										const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1;
										const showEllipsisAfter = idx < arr.length - 1 && arr[idx + 1] !== page + 1;
										
										return (
											<React.Fragment key={page}>
												{showEllipsisBefore && (
													<Button variant="outline" size="sm" disabled className="px-3">
														...
													</Button>
												)}
												<Button
													key={page}
													variant={pagination.currentPage === page ? "default" : "outline"}
													size="sm"
													className={pagination.currentPage === page ? "bg-blue-600" : ""}
											onClick={() => handlePageChange(page)}
										>
											{page}
												</Button>
												{showEllipsisAfter && (
													<Button variant="outline" size="sm" disabled className="px-3">
														...
													</Button>
												)}
											</React.Fragment>
										);
									})}
								<Button 
									variant="outline" 
									size="sm" 
									onClick={() => handlePageChange(pagination.currentPage + 1)}
									disabled={pagination.currentPage >= pagination.totalPages}
								>
									Next <ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}

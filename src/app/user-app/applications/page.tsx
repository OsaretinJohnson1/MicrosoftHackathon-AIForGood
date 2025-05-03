"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, Search, Filter, Clock, CheckCircle, AlertCircle, ArrowRight, Loader2, ChevronLeft, ChevronRight, Plus, XCircle, Download, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
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
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { toast } from "sonner"

// Type for application data
interface Application {
    id: string
    type: string
    amount: number
    date: string
    status: string
    progress: number
    nextStep?: string | null
    result?: string | null
    loanId?: string | null
    reason?: string
    isActive?: boolean
    rawData: any
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
}

// Type for sort options
interface SortOptions {
    field: string
    direction: 'asc' | 'desc'
}

export default function ApplicationsPage() {
    const { data: session, status: sessionStatus } = useSession()
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
            const saved = localStorage.getItem('applicationsSearchQuery')
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
            const saved = localStorage.getItem('applicationsCurrentPage')
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
        
        // Create filter object with URL values
        const filters: FilterOptions = {
            status: urlStatus,
            amountMin: urlAmountMin ? Number(urlAmountMin) : null,
            amountMax: urlAmountMax ? Number(urlAmountMax) : null,
            dateFrom: urlDateFrom ? new Date(urlDateFrom) : null,
            dateTo: urlDateTo ? new Date(urlDateTo) : null,
            purpose: urlPurpose
        }
        
        // Fall back to localStorage if URL doesn't have values
        if (typeof window !== 'undefined') {
            const savedFilters = localStorage.getItem('applicationsFilters')
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
            const savedSort = localStorage.getItem('applicationsSortOptions')
            if (savedSort) {
                try {
                    return JSON.parse(savedSort)
                } catch (e) {
                    // Fall back to default
                    return { field: 'date', direction: 'desc' }
                }
            }
        }
        return { field: 'date', direction: 'desc' }
    }

    // Save filter state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('applicationsFilters', JSON.stringify(filters))
        }
    }, [filters])
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('applicationsSearchQuery', searchTerm)
        }
    }, [searchTerm])
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('applicationsSortOptions', JSON.stringify(sortOptions))
        }
    }, [sortOptions])
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('applicationsCurrentPage', pagination.currentPage.toString())
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
        setActiveFilterCount(count)
    }, [filters])

    // Fetch applications when component mounts or when search/filters/pagination change
    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user?.id) {
            fetchApplications(pagination.currentPage)
        } else if (sessionStatus === "unauthenticated") {
            router.push("/auth/login")
        }
    }, [sessionStatus, session, router, pagination.currentPage, debouncedSearchTerm, filters, sortOptions])

    const fetchApplications = async (pageNumber: number = 1) => {
        try {
            setLoading(true)
            setError(null)

            // Make sure we have a valid user session
            if (!session?.user?.id) {
                setError("No user session found. Please log in again.")
                setLoading(false)
                return
            }

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

            const response = await fetch(`/api/crud-users/read-user-applications?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            if (!response.ok) {
                    throw new Error("Failed to fetch applications")
                }
            
            const data = await response.json()

            if (data.success) {
                const applicationsData = data.data

                    if (Array.isArray(applicationsData)) {
                    // Process and format applications data
                    const processedApplications = applicationsData.map((item: any) => {
                                    const app = item.application
                        const status = app.status?.toLowerCase() || ""
                        
                                    return {
                                        id: `APP-${app.id}`,
                                        type: item.loanType?.name || "Loan Application",
                                        amount: parseFloat(app.loanAmount) || 0,
                                        date: formatDate(app.applicationDate),
                            status: status === "pending" ? "Under Review" : 
                                   status === "approved" ? "Approved" :
                                   status === "rejected" ? "Declined" :
                                   status === "disbursed" ? "Funded" :
                                   status === "completed" ? "Completed" : 
                                   app.status,
                            progress: status === "pending" ? 30 : 
                                      status === "approved" && app.isDisbursed === 0 ? 75 :
                                      status === "disbursed" || status === "completed" ? 100 : 0,
                            nextStep: status === "pending" ? "Application Review" : 
                                      status === "approved" && app.isDisbursed === 0 ? "Disbursement" : 
                                      null,
                            result: status === "rejected" ? "Not Approved" :
                                   status === "disbursed" ? "Funded" :
                                   status === "completed" ? "Completed" : null,
                            loanId: status !== "pending" && status !== "rejected" ? `LOAN-${app.id.toString().padStart(3, '0')}` : null,
                                        reason: app.rejectionReason || "Application did not meet requirements",
                            isActive: status === "pending" || (status === "approved" && app.isDisbursed === 0),
                                        rawData: app
                                    }
                                })

                        setApplications(processedApplications)
                    setPagination({
                        currentPage: data.pagination.page,
                        totalPages: data.pagination.totalPages,
                        totalCount: data.pagination.totalCount
                    })
                    } else {
                        console.error("API returned unexpected data structure:", applicationsData)
                        setError("Applications data has an unexpected format. Please try again later.")
                    }
                } else {
                console.error("API error:", data.message || "Unknown error")
                setError(data.message || "Failed to load applications")
                }
        } catch (err) {
            console.error("Error fetching applications:", err)
            setError("An error occurred while fetching your applications. Please try again later.")
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
            purpose: null
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
            purpose: null
        })
        
        // Reset sorting to default
        setSortOptions({
            field: 'date',
            direction: 'desc'
        })
        
        // Reset to first page
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }))
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('applicationsFilters')
            localStorage.removeItem('applicationsSearchQuery')
            localStorage.removeItem('applicationsSortOptions')
            localStorage.removeItem('applicationsCurrentPage')
        }
        
        // Clear URL parameters
        const path = window.location.pathname
        window.history.pushState({}, '', path)
        
        // Fetch fresh data
        fetchApplications(1)
    }

    // Filter applications based on search and filters
    const filteredApplications = applications.filter(app => {
        // Search term filter
        const matchesSearch = 
            app.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.loanId && app.loanId.toLowerCase().includes(searchTerm.toLowerCase()))
            
        // Status filter
        const matchesStatus = 
            !filters.status || 
            app.status.toLowerCase() === filters.status.toLowerCase()
            
        // Amount filter
        const matchesAmount = 
            (filters.amountMin === null || app.amount >= filters.amountMin) &&
            (filters.amountMax === null || app.amount <= filters.amountMax)
            
        // Date filter - would need to convert string dates to Date objects
        const appDate = new Date(app.date)
        const matchesDate = 
            (filters.dateFrom === null || appDate >= filters.dateFrom) &&
            (filters.dateTo === null || appDate <= filters.dateTo)
            
        // Purpose filter - (would need purpose data in the application object)
        const matchesPurpose = 
            !filters.purpose || 
            (app.rawData.purpose && app.rawData.purpose.toLowerCase().includes(filters.purpose.toLowerCase()))
            
        return matchesSearch && matchesStatus && matchesAmount && matchesDate && matchesPurpose
    })

    // Get status badge styles
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved":
                return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
            case "Under Review":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Under Review</Badge>
            case "Pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
            case "Processing":
                return <Badge className="bg-blue-400 hover:bg-blue-500">Processing</Badge>
            case "Declined":
                return <Badge className="bg-red-500 hover:bg-red-600">Declined</Badge>
            case "Funded":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Funded</Badge>
            case "Completed":
                return <Badge className="bg-green-700 hover:bg-green-800">Completed</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    // Format currency
    const formatCurrency = (amount: number | string | null) => {
        if (amount === null) return "R0.00"
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }).format(Number(amount))
    }

    if (loading && applications.length === 0) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Loading your applications...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Loan Applications</h1>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                    <Button onClick={() => fetchApplications(1)}>
                        Try Again
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                        If the problem persists, please contact customer support.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Loan Applications</h1>
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
                                <DropdownMenuItem onClick={() => applyFilter("status", "Under Review")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                        Under Review
                                        {filters.status === "Under Review" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "Approved")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        Approved
                                        {filters.status === "Approved" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "Declined")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                        Declined
                                        {filters.status === "Declined" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "Funded")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                        Funded
                                        {filters.status === "Funded" && <span className="ml-auto">✓</span>}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => applyFilter("status", "Completed")}>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-700 mr-2"></span>
                                        Completed
                                        {filters.status === "Completed" && <span className="ml-auto">✓</span>}
                </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => handleSortChange('date')}>
                                    Latest First
                                    {sortOptions.field === 'date' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('date')}>
                                    Oldest First
                                    {sortOptions.field === 'date' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('amount')}>
                                    Amount (High to Low)
                                    {sortOptions.field === 'amount' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange('amount')}>
                                    Amount (Low to High)
                                    {sortOptions.field === 'amount' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
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
                            New Application
                    </Button>
                </div>
            </div>

            {/* Application Process Guide - Moved to beginning */}
            <Card className="mb-6">
                <CardHeader>
                                    <CardTitle>Application Process</CardTitle>
                                    <CardDescription>Understanding the loan application journey</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        {[
                                            {
                                                step: "1",
                                                title: "Application",
                                                description: "Fill out and submit your loan application",
                                                icon: FileText,
                                            },
                                            {
                                                step: "2",
                                                title: "Review",
                                                description: "Our team reviews your application and documents",
                                                icon: Clock,
                                            },
                                            {
                                                step: "3",
                                                title: "Approval",
                                                description: "Receive a decision on your loan application",
                                                icon: CheckCircle,
                                            },
                                            {
                                                step: "4",
                                                title: "Funding",
                                                description: "Approved funds are disbursed to your account",
                                                icon: DollarSign,
                                            },
                                        ].map((step, i) => (
                                            <div key={i} className="rounded-lg border p-4 text-center">
                                                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                    {step.step}
                                                </div>
                                                <h3 className="mb-1 font-medium">{step.title}</h3>
                                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

            {/* Search and filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search applications..."
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
                    </div>
                )}
            </div>

            {/* Quick status filter buttons */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={filters.status === "Under Review" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "Under Review" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "Under Review" ? null : "Under Review")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "Under Review" ? "bg-white" : "bg-yellow-500"} mr-2`}></span>
                        Under Review
                    </Button>
                    <Button 
                        variant={filters.status === "Approved" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "Approved" ? "bg-green-500 hover:bg-green-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "Approved" ? null : "Approved")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "Approved" ? "bg-white" : "bg-green-500"} mr-2`}></span>
                        Approved
                    </Button>
                    <Button 
                        variant={filters.status === "Declined" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "Declined" ? "bg-red-500 hover:bg-red-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "Declined" ? null : "Declined")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "Declined" ? "bg-white" : "bg-red-500"} mr-2`}></span>
                        Declined
                    </Button>
                    <Button 
                        variant={filters.status === "Funded" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "Funded" ? "bg-blue-500 hover:bg-blue-600" : ""}
                        onClick={() => applyFilter("status", filters.status === "Funded" ? null : "Funded")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "Funded" ? "bg-white" : "bg-blue-500"} mr-2`}></span>
                        Funded
                    </Button>
                    <Button 
                        variant={filters.status === "Completed" ? "default" : "outline"} 
                        size="sm" 
                        className={filters.status === "Completed" ? "bg-green-700 hover:bg-green-800" : ""}
                        onClick={() => applyFilter("status", filters.status === "Completed" ? null : "Completed")}
                    >
                        <span className={`w-2 h-2 rounded-full ${filters.status === "Completed" ? "bg-white" : "bg-green-700"} mr-2`}></span>
                        Completed
                    </Button>
                </div>
            </div>

            {applications.length === 0 && !loading ? (
                <Card className="mb-6 bg-muted/40">
                    <CardContent className="pt-6 text-center">
                        <div className="mb-4">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No loan applications yet</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven't applied for any loans yet. Get started by applying for your first loan.
                        </p>
                        <Button onClick={() => router.push("/user-app/applications/new")}>Apply Now</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {applications.length > 0 && filteredApplications.length === 0 ? (
                        <Card className="mb-6 bg-muted/40">
                            <CardContent className="pt-6 text-center">
                                <div className="mb-4">
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">No matching applications</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm ? 
                                        `No applications found matching "${searchTerm}"${activeFilterCount > 0 ? ' with the current filters' : ''}.` : 
                                        'No applications match the current filters.'}
                                </p>
                                <div className="flex justify-center gap-3">
                                    {searchTerm && (
                                        <Button variant="outline" onClick={() => handleSearchChange('')}>
                                            Clear Search
                                        </Button>
                                    )}
                                    {activeFilterCount > 0 && (
                                        <Button variant="outline" onClick={clearAllFilters}>
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button onClick={handleRefresh}>
                                        Reset All
                                </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                            {filteredApplications.map((application) => (
                                <Card key={application.id} className="card-hover">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{application.type}</CardTitle>
                                            {getStatusBadge(application.status)}
                                        </div>
                                        <CardDescription>Application ID: {application.id}</CardDescription>
                        </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Requested Amount</p>
                                                <p className="text-lg font-semibold">{formatCurrency(application.amount)}</p>
                                            </div>
                                                <div>
                                                <p className="text-sm text-muted-foreground">Submission Date</p>
                                                <p className="text-lg font-semibold">{application.date}</p>
                                            </div>
                                        </div>

                                        {application.progress > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Application Progress</span>
                                                    <span className="font-medium">{application.progress}%</span>
                                                </div>
                                                <Progress
                                                    value={application.progress}
                                                    className="h-2 bg-secondary relative"
                                                />
                                            </div>
                                        )}

                                        {/* Application status details */}
                                        {application.status === "Under Review" && (
                                            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                                                <div className="flex items-start gap-3">
                                                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Application Under Review</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Your application is being assessed by our team.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {application.status === "Approved" && application.nextStep === "Disbursement" && (
                                            <div className="p-3 rounded-md bg-green-50 border border-green-200">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium">Application Approved</p>
                                                                <p className="text-sm text-muted-foreground">
                                                            Your loan has been approved and is pending disbursement.
                                                                </p>
                                                    </div>
                                                </div>
                                                            </div>
                                        )}

                                        {application.status === "Declined" && (
                                            <div className="p-3 rounded-md bg-red-50 border border-red-200">
                                                <div className="flex items-start gap-3">
                                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium">Application Not Approved</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Reason: {application.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                                            </div>
                                        )}

                                        {(application.status === "Funded" || application.status === "Completed") && (
                                            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Loan {application.status}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Loan ID: {application.loanId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end">
                                            <Button size="sm" asChild>
                                                <Link href={`/user-app/applications/${application.rawData.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                    ))}
                                </div>
                    )}

                    {/* Pagination Controls */}
                    {applications.length > 0 && (
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Showing {(pagination.currentPage - 1) * 4 + 1} to {Math.min(pagination.currentPage * 4, pagination.totalCount)} of {pagination.totalCount} applications
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

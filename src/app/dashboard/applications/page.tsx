"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Search, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuGroup, 
	DropdownMenuItem, 
	DropdownMenuLabel, 
	DropdownMenuSeparator, 
	DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

// Define interfaces for type safety
interface ApplicationData {
	id: string;
	name: string;
	amount: string;
	term: string;
	purpose: string;
	status: string;
	date: string;
	interestRate: string;
	userId: number;
	raw: any;
}

// Define sort interface
interface SortOptions {
	field: string;
	direction: 'asc' | 'desc';
}

export default function ApplicationsPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	
	// Initialize state from URL parameters first, falling back to localStorage
	const getInitialStatusFilter = () => {
		// Check URL first
		const urlStatus = searchParams.get('status')
		if (urlStatus) return urlStatus
		
		// Then localStorage
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('applicationsStatusFilter')
			return saved || "all"
		}
		return "all"
	}
	
	const getInitialSearchQuery = () => {
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
	
	const getInitialPage = () => {
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
	
	const getInitialSortOptions = (): SortOptions => {
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
	
	const [statusFilter, setStatusFilter] = useState(getInitialStatusFilter())
	const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery())
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(getInitialSearchQuery())
	const [currentPage, setCurrentPage] = useState(getInitialPage())
	const [sortOptions, setSortOptions] = useState<SortOptions>(getInitialSortOptions())
	
	// Update localStorage when filters change
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsStatusFilter', statusFilter);
		}
	}, [statusFilter]);
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsSearchQuery', searchQuery);
		}
	}, [searchQuery]);
	
	// Save sort options to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsSortOptions', JSON.stringify(sortOptions));
		}
	}, [sortOptions]);
	
	const [applications, setApplications] = useState<ApplicationData[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [totalPages, setTotalPages] = useState(1)
	const [totalItems, setTotalItems] = useState(0)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	
	// Add filter tracking
	const [activeFilterCount, setActiveFilterCount] = useState(0)
	
	// Debounce search query
	useEffect(() => {
		console.log('Search query changed to:', searchQuery);
		const handler = setTimeout(() => {
			console.log('Debounce timeout reached - updating search term');
			setDebouncedSearchQuery(searchQuery);
		}, 500); // Increased timeout for better UX

		return () => {
			clearTimeout(handler);
		};
	}, [searchQuery]);

	useEffect(() => {
		// Fetch applications data when component mounts or filters/search/sort change
		console.log('useEffect triggered - fetchApplications');
		fetchApplications()
	}, [currentPage, statusFilter, debouncedSearchQuery, sortOptions, itemsPerPage])
	
	// Update active filter count
	useEffect(() => {
		let count = 0
		if (statusFilter !== "all") count++
		setActiveFilterCount(count)
	}, [statusFilter])

	// Save current page to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsCurrentPage', currentPage.toString());
		}
	}, [currentPage]);

	// Listen for popstate events (browser back/forward)
	useEffect(() => {
		const handlePopState = () => {
			// Read state from URL when user navigates with browser buttons
			const params = new URLSearchParams(window.location.search);
			
			// Update page
			const page = params.get('page');
			if (page) {
				setCurrentPage(parseInt(page, 10));
			} else {
				setCurrentPage(1);
			}
			
			// Update status filter
			const status = params.get('status');
			setStatusFilter(status || 'all');
			
			// Update search query
			const search = params.get('q');
			if (search !== null) {
				setSearchQuery(search);
				setDebouncedSearchQuery(search);
			}
			
			// Update sort options
			const sortField = params.get('sortField');
			const sortDir = params.get('sortDir') as 'asc' | 'desc';
			
			if (sortField && (sortDir === 'asc' || sortDir === 'desc')) {
				setSortOptions({
					field: sortField,
					direction: sortDir
				});
			}
			
			// Log state change from popstate
			console.log('State restored from URL after popstate event');
		};
		
		// Add event listener
		window.addEventListener('popstate', handlePopState);
		
		// Clean up
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, []);

	const fetchApplications = async () => {
		setLoading(true)
		try {
			// Debug pagination state
			console.log(`Fetching page ${currentPage} of ${totalPages}, with ${itemsPerPage} items per page`);
			console.log(`Current filters - Status: ${statusFilter}, Search: "${searchQuery}", Sort: ${sortOptions.field}:${sortOptions.direction}`);
			
			// Build query parameters for application search and filtering
			const queryParams = new URLSearchParams({
				page: currentPage.toString(),
				limit: itemsPerPage.toString(),
				sortField: sortOptions.field,
				sortDirection: sortOptions.direction
			})
			
			// Add status filter if not "all"
			if (statusFilter !== "all") {
				queryParams.append('status', statusFilter.toLowerCase())
			}
			
			// Add search term if it exists (try multiple formats)
			if (debouncedSearchQuery.trim()) {
				queryParams.append('search', debouncedSearchQuery.trim())
				queryParams.append('query', debouncedSearchQuery.trim())
				queryParams.append('searchTerm', debouncedSearchQuery.trim())
				queryParams.append('filter', debouncedSearchQuery.trim())
				console.log('Searching for term:', debouncedSearchQuery.trim())
			}
			
			console.log('API Request URL:', `/api/crud-users/read-applications?${queryParams.toString()}`);
			
			const response = await fetch(`/api/crud-users/read-applications?${queryParams.toString()}`)
			const result = await response.json()
			
			// Log the received data for debugging
			console.log('API returned data:', {
				success: result.success,
				dataCount: result.data?.length || 0,
				pagination: result.pagination
			});
			
			if (result.success) {
				let allData = result.data || []
				
				// Always perform client-side filtering for search to ensure correct results
				if (debouncedSearchQuery.trim()) {
					console.log('Performing client-side filtering for search term');
					const searchTermLower = debouncedSearchQuery.trim().toLowerCase();
					
					// Debug the first few items to see what data we're working with
					console.log('First few items before filtering:', allData.slice(0, 3).map((app: ApplicationData) => ({
						id: app.id,
						name: app.name,
						amount: app.amount,
						purpose: app.purpose,
						status: app.status
					})));
					
					allData = allData.filter((app: ApplicationData) => {
						if (!app) return false;
						
						// Safely access properties with fallbacks to empty string
						const appId = (app.id || '').toLowerCase();
						const customer = (app.name || '').toLowerCase();
						const purpose = (app.purpose || '').toLowerCase();
						const status = (app.status || '').toLowerCase();
						const amount = (app.amount || '').toLowerCase();
						
						// Check if the search term is in any of these fields
						const matchesId = appId.includes(searchTermLower);
						const matchesCustomer = customer.includes(searchTermLower);
						const matchesPurpose = purpose.includes(searchTermLower);
						const matchesStatus = status.includes(searchTermLower);
						const matchesAmount = amount.includes(searchTermLower);
						
						// Additional matching against raw data if available
						let matchesRaw = false;
						if (app.raw) {
							try {
								// Try to match against any customer-related fields in raw data
								const rawCustomerName = app.raw.customerName?.toLowerCase() || '';
								const rawFullName = app.raw.fullName?.toLowerCase() || '';
								const rawFirstName = app.raw.firstName?.toLowerCase() || '';
								const rawLastName = app.raw.lastName?.toLowerCase() || '';
								
								matchesRaw = 
									rawCustomerName.includes(searchTermLower) ||
									rawFullName.includes(searchTermLower) ||
									rawFirstName.includes(searchTermLower) ||
									rawLastName.includes(searchTermLower);
							} catch (e) {
								console.error('Error processing raw data for search:', e);
							}
						}
						
						const matches = matchesId || matchesCustomer || matchesPurpose || 
										matchesStatus || matchesAmount || matchesRaw;
						
						// Debug non-matching items when expected to match
						if (!matches && 
							(searchTermLower.length > 2) && 
							(customer.length > 0 && 
							 (customer.includes(searchTermLower.substring(0, 3)) || 
							  searchTermLower.includes(customer.substring(0, 3))))) {
							console.log('Near miss - Search term nearly matched customer:', {
								searchTerm: searchTermLower,
								customer: customer,
								app: app
							});
						}
						
						return matches;
					});
					
					// Debug the filtered results
					console.log(`Filtered to ${allData.length} matches for search term "${debouncedSearchQuery}"`);
					if (allData.length > 0) {
						console.log('First few matching items:', allData.slice(0, 3).map((app: ApplicationData) => ({
							id: app.id,
							name: app.name,
							amount: app.amount,
							purpose: app.purpose,
							status: app.status
						})));
					} else {
						console.log('No matches found. Search term might not match any customer names in the data.');
					}
				}
				
				// Always apply client-side sorting for consistency
				if (allData.length > 0) {
					console.log(`Applying client-side sorting by ${sortOptions.field} (${sortOptions.direction})`);
					allData = applySorting(allData, sortOptions);
				}
				
				// ALWAYS use client-side pagination for search results to ensure correct paging
				if (debouncedSearchQuery.trim() || allData.length > itemsPerPage) {
					console.log('Using client-side pagination for search results');
					
					// Store total count of all filtered data
					const totalFilteredItems = allData.length;
					const calculatedTotalPages = Math.max(1, Math.ceil(totalFilteredItems / itemsPerPage));
					
					// Apply page slicing
					const startIndex = (currentPage - 1) * itemsPerPage;
					const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
					
					// Only take the items for current page
					const paginatedData = allData.slice(startIndex, endIndex);
					
					console.log(`Showing items ${startIndex+1}-${endIndex} of ${totalFilteredItems} total`);
					console.log(`Page ${currentPage} of ${calculatedTotalPages} (${paginatedData.length} items on this page)`);
					
					// Update the state with paginated data
					setApplications(paginatedData);
					setTotalItems(totalFilteredItems);
					setTotalPages(calculatedTotalPages);
				} else if (result.pagination) {
					// Use server pagination for non-search results
					console.log('Using server-side pagination');
					setApplications(allData);
					setTotalPages(result.pagination.totalPages || 1);
					setTotalItems(result.pagination.totalItems || 0);
				} else {
					// Fallback if no pagination info from server
					setApplications(allData);
					setTotalItems(allData.length);
					setTotalPages(1);
				}
				
				// Ensure current page is valid
				if (currentPage > totalPages && totalPages > 0) {
					console.log(`Current page ${currentPage} exceeds total pages ${totalPages}, resetting to page 1`);
					setCurrentPage(1);
					
					// Update URL 
					const params = new URLSearchParams(window.location.search);
					params.set('page', '1');
					const path = window.location.pathname;
					window.history.pushState({}, '', `${path}?${params.toString()}`);
				}

				setError(null)
			} else {
				setError(result.message || "Failed to fetch applications")
				setApplications([])
				setTotalItems(0)
				setTotalPages(1)
			}
		} catch (err) {
			console.error("Error fetching applications:", err)
			setError("An error occurred while fetching applications")
			setApplications([])
			setTotalItems(0)
			setTotalPages(1)
		} finally {
			setLoading(false)
		}
	}

	// Helper function to apply sorting
	const applySorting = (data: ApplicationData[], sortOpts: SortOptions) => {
		// Debug sorting if amount is the field
		if (sortOpts.field === 'amount') {
			console.log('Debugging amount sorting:');
			data.slice(0, 3).forEach(app => {
				const rawAmount = app.amount;
				const cleanedAmount = app.amount.replace(/[$,\s]/g, '');
				const parsedAmount = parseFloat(cleanedAmount);
				console.log(`Raw: "${rawAmount}", Cleaned: "${cleanedAmount}", Parsed: ${parsedAmount}`);
			});
		}
		
		return [...data].sort((a, b) => {
			// For numeric comparisons
			let numA = 0;
			let numB = 0;
			// For string comparisons
			let strA = '';
			let strB = '';
			// Flag to determine if we're comparing strings or numbers
			let isStringComparison = false;
			
			// Extract values based on sort field
			switch (sortOpts.field) {
				case 'id':
					strA = a.id;
					strB = b.id;
					isStringComparison = true;
					break;
				case 'name':
					strA = a.name;
					strB = b.name;
					isStringComparison = true;
					break;
				case 'amount':
					// Consistent amount parsing for monetary values
					const cleanAmount = (str: string) => {
						// Remove all non-numeric characters except decimal point and minus sign
						const cleaned = str.replace(/[^\d.-]/g, '');
						// Parse to number, default to 0 if invalid
						const num = parseFloat(cleaned);
						return isNaN(num) ? 0 : num;
					};
					
					numA = cleanAmount(a.amount);
					numB = cleanAmount(b.amount);
					break;
				case 'term':
					// Extract numeric part from term (e.g., "12 months" -> 12)
					numA = parseInt(a.term.replace(/[^0-9]/g, '')) || 0;
					numB = parseInt(b.term.replace(/[^0-9]/g, '')) || 0;
					break;
				case 'purpose':
					strA = a.purpose;
					strB = b.purpose;
					isStringComparison = true;
					break;
				case 'status':
					strA = a.status;
					strB = b.status;
					isStringComparison = true;
					break;
				case 'date':
					// Convert date strings to Date objects for comparison
					numA = new Date(a.date).getTime();
					numB = new Date(b.date).getTime();
					break;
				default:
					// Default to sorting by date if field is not recognized
					numA = new Date(a.date).getTime();
					numB = new Date(b.date).getTime();
			}
			
			// Apply sort direction
			if (sortOpts.direction === 'asc') {
				if (isStringComparison) {
					return strA.localeCompare(strB);
				}
				return numA - numB;
			} else {
				if (isStringComparison) {
					return strB.localeCompare(strA);
				}
				return numB - numA;
			}
		});
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
		
		// Save to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsSortOptions', JSON.stringify(newSortOptions));
			localStorage.setItem('applicationsCurrentPage', '1');
		}
	};
	
	// Handle refresh to reset filters and search
	const handleRefresh = () => {
		// Reset search
		setSearchQuery("")
		setDebouncedSearchQuery("")
		
		// Reset filter
		setStatusFilter("all")
		
		// Reset sorting to default
		setSortOptions({
			field: 'date',
			direction: 'desc'
		})
		
		// Reset to first page
		setCurrentPage(1)
		
		// Clear localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('applicationsStatusFilter');
			localStorage.removeItem('applicationsSearchQuery');
			localStorage.removeItem('applicationsSortOptions');
			localStorage.removeItem('applicationsCurrentPage');
		}
		
		// Clear URL parameters by replacing with clean URL
		const path = window.location.pathname;
		window.history.pushState({}, '', path);
		
		// Fetch fresh data
		fetchApplications()
	}

	const handleViewApplication = (applicationId: string) => {
		router.push(`/dashboard/applications/${applicationId}`)
	}

	const handlePageChange = (page: number) => {
		// Log detailed information about the state before changing page
		console.log(`======= PAGE CHANGE REQUEST =======`);
		console.log(`Changing from page ${currentPage} to ${page}`);
		console.log(`Current state before change:`);
		console.log(`- Status filter: ${statusFilter}`);
		console.log(`- Search query: "${searchQuery}"`);
		console.log(`- Sort: ${sortOptions.field} (${sortOptions.direction})`);
		console.log(`====================================`);
		
		// Update the URL to reflect current state
		const params = new URLSearchParams();
		params.set('page', page.toString());
		if (statusFilter !== 'all') params.set('status', statusFilter);
		if (searchQuery) params.set('q', searchQuery);
		params.set('sortField', sortOptions.field);
		params.set('sortDir', sortOptions.direction);
		
		// Get the current path without query parameters
		const path = window.location.pathname;
		
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${path}?${params.toString()}`);
		
		// Update the state
		setCurrentPage(page);
		
		// Save to localStorage as backup
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsCurrentPage', page.toString());
			localStorage.setItem('applicationsStatusFilter', statusFilter);
			localStorage.setItem('applicationsSearchQuery', searchQuery);
			localStorage.setItem('applicationsSortOptions', JSON.stringify(sortOptions));
		}
	};

	// Calculate pagination information
	const startIndex = (currentPage - 1) * itemsPerPage + 1;
	const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

	// Handle status filter change
	const handleStatusFilterChange = (status: string) => {
		// Update URL with new status
		const params = new URLSearchParams(window.location.search);
		
		if (status === 'all') {
			params.delete('status');
		} else {
			params.set('status', status);
		}
		
		// Reset page when filter changes
		params.set('page', '1');
		
		// Get the current path without query parameters
		const path = window.location.pathname;
		
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${path}?${params.toString()}`);
		
		// Update state
		setStatusFilter(status);
		setCurrentPage(1);
		
		// Save to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsStatusFilter', status);
			localStorage.setItem('applicationsCurrentPage', '1');
		}
	};

	// Add state for the page jump input
	const [pageJumpInput, setPageJumpInput] = useState("");
	
	// Handle jump to specific page
	const handlePageJump = (e: React.FormEvent) => {
		e.preventDefault();
		const pageNumber = parseInt(pageJumpInput, 10);
		if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
			handlePageChange(pageNumber);
		}
		setPageJumpInput("");
	};

	// Handle search query change
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
		
		// Save to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('applicationsSearchQuery', query);
			localStorage.setItem('applicationsCurrentPage', '1');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gray-50"
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<h2 className="text-3xl font-bold tracking-tight text-gray-900">Loan Applications</h2>
				<div className="flex items-center gap-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="border-2 hover:bg-gray-100 transition-colors rounded-lg">
								<Filter className="mr-2 h-4 w-4 text-gray-600" />
								Filter
								{activeFilterCount > 0 && (
									<Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
										{activeFilterCount}
									</Badge>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("all")}>
									All Applications
									{statusFilter === "all" && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("pending")}>
									<div className="flex items-center">
										<span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
										Pending
										{statusFilter === "pending" && <span className="ml-auto">✓</span>}
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("approved")}>
									<div className="flex items-center">
										<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
										Approved
										{statusFilter === "approved" && <span className="ml-auto">✓</span>}
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("rejected")}>
									<div className="flex items-center">
										<span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
										Rejected
										{statusFilter === "rejected" && <span className="ml-auto">✓</span>}
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("disbursed")}>
									<div className="flex items-center">
										<span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
										Disbursed
										{statusFilter === "disbursed" && <span className="ml-auto">✓</span>}
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusFilterChange("completed")}>
									<div className="flex items-center">
										<span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
										Completed
										{statusFilter === "completed" && <span className="ml-auto">✓</span>}
									</div>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Sort Order</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setSortOptions({field: 'date', direction: 'desc'})}>
									Latest First
									{sortOptions.field === 'date' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortOptions({field: 'date', direction: 'asc'})}>
									Oldest First
									{sortOptions.field === 'date' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortOptions({field: 'amount', direction: 'desc'})}>
									Highest Amount
									{sortOptions.field === 'amount' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortOptions({field: 'amount', direction: 'asc'})}>
									Lowest Amount
									{sortOptions.field === 'amount' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
							</DropdownMenuGroup>
							{activeFilterCount > 0 && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => handleStatusFilterChange("all")} className="text-red-500 hover:text-red-600 font-medium">
										Clear Filters
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button variant="outline" size="sm" className="border-2 hover:bg-gray-100 transition-colors rounded-lg">
						<Download className="mr-2 h-4 w-4 text-gray-600" />
						Export
					</Button>
					<Button
						size="sm"
						className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
						onClick={() => router.push('/dashboard/applications/new')}
					>
						New Application
					</Button>
				</div>
			</div>

			<Card className="card-hover border-2 shadow-md">
				<CardHeader className="pb-3">
					<CardTitle>Application Management</CardTitle>
					<CardDescription>Review and process loan applications from customers</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
							<div className="relative w-full sm:w-auto">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search applications..."
									className="pl-8 w-full sm:w-[300px] rounded-full border-2 border-yellow-400 focus-visible:ring-yellow-400"
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
								className="rounded-full border-2 border-yellow-400 hover:bg-yellow-100 text-black"
								variant="outline"
								onClick={handleRefresh}
							>
								Refresh
							</Button>
						</div>
						
						{/* Active Filters Display */}
						{activeFilterCount > 0 && (
							<div className="flex flex-wrap gap-2">
								{statusFilter !== "all" && (
									<Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 py-1">
										Status: {statusFilter}
										<Button 
											variant="ghost" 
											size="sm" 
											className="h-4 w-4 p-0 ml-1" 
											onClick={() => handleStatusFilterChange("all")}
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								)}
							</div>
						)}
					</div>
					
					{/* Quick filter buttons */}
					<div className="mb-6">
						<div className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</div>
						<div className="flex flex-wrap gap-2">
							<Button 
								variant={statusFilter === "all" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "all" ? "bg-gray-600 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
								onClick={() => handleStatusFilterChange("all")}
							>
								All
							</Button>
							<Button 
								variant={statusFilter === "pending" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "pending" ? "bg-amber-600 hover:bg-amber-700" : "border-amber-200 text-amber-700 hover:bg-amber-50"}
								onClick={() => handleStatusFilterChange("pending")}
							>
								<span className={`w-2 h-2 rounded-full ${statusFilter === "pending" ? "bg-white" : "bg-amber-500"} mr-2`}></span>
								Pending
							</Button>
							<Button 
								variant={statusFilter === "approved" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}
								onClick={() => handleStatusFilterChange("approved")}
							>
								<span className={`w-2 h-2 rounded-full ${statusFilter === "approved" ? "bg-white" : "bg-emerald-500"} mr-2`}></span>
								Approved
							</Button>
							<Button 
								variant={statusFilter === "rejected" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-700 hover:bg-red-50"}
								onClick={() => handleStatusFilterChange("rejected")}
							>
								<span className={`w-2 h-2 rounded-full ${statusFilter === "rejected" ? "bg-white" : "bg-red-500"} mr-2`}></span>
								Rejected
							</Button>
							<Button 
								variant={statusFilter === "disbursed" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "disbursed" ? "bg-blue-600 hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"}
								onClick={() => handleStatusFilterChange("disbursed")}
							>
								<span className={`w-2 h-2 rounded-full ${statusFilter === "disbursed" ? "bg-white" : "bg-blue-500"} mr-2`}></span>
								Disbursed
							</Button>
							<Button 
								variant={statusFilter === "completed" ? "default" : "outline"} 
								size="sm" 
								className={statusFilter === "completed" ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-700 hover:bg-purple-50"}
								onClick={() => handleStatusFilterChange("completed")}
							>
								<span className={`w-2 h-2 rounded-full ${statusFilter === "completed" ? "bg-white" : "bg-purple-500"} mr-2`}></span>
								Completed
							</Button>

							<div className="mx-2 border-l border-gray-200 h-6"></div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										Sort by: {sortOptions.field === 'date' ? 'Date' : 
												sortOptions.field === 'amount' ? 'Amount' : 
												sortOptions.field}
										<ChevronDown className="ml-1 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setSortOptions({field: 'date', direction: 'desc'})}>
										Latest First
										{sortOptions.field === 'date' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortOptions({field: 'date', direction: 'asc'})}>
										Oldest First
										{sortOptions.field === 'date' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setSortOptions({field: 'amount', direction: 'desc'})}>
										Highest Amount
										{sortOptions.field === 'amount' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortOptions({field: 'amount', direction: 'asc'})}>
										Lowest Amount
										{sortOptions.field === 'amount' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className="rounded-lg border-2 border-gray-200 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-yellow-50">
									<TableHead>
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('id')}>
											Application ID
											{sortOptions.field === 'id' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead>
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('name')}>
											Customer
											{sortOptions.field === 'name' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead>
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('amount')}>
											Amount
											{sortOptions.field === 'amount' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead>
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('term')}>
											Term
											{sortOptions.field === 'term' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead className="hidden md:table-cell">
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('purpose')}>
											Purpose
											{sortOptions.field === 'purpose' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead>
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('status')}>
											Status
											{sortOptions.field === 'status' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead className="hidden md:table-cell">
										<div className="flex items-center cursor-pointer" onClick={() => handleSortChange('date')}>
											Date
											{sortOptions.field === 'date' && (
												<ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
											)}
										</div>
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={8} className="h-24 text-center">
											<div className="flex flex-col items-center justify-center space-y-2">
												<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400"></div>
												<p className="text-sm text-muted-foreground">Loading applications...</p>
											</div>
										</TableCell>
									</TableRow>
								) : error ? (
									<TableRow>
										<TableCell colSpan={8} className="h-24 text-center">
											<div className="flex flex-col items-center justify-center space-y-2">
												<AlertCircle className="h-8 w-8 text-red-500" />
												<p className="text-lg font-medium text-red-500">Error loading applications</p>
												<p className="text-sm text-muted-foreground">{error}</p>
												<Button
													variant="outline"
													size="sm"
													onClick={fetchApplications}
													className="mt-2 border-2 border-yellow-400 hover:bg-yellow-100 text-black"
												>
													Retry
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : applications.length > 0 ? (
									applications.map((app) => (
										<TableRow key={app.id} className="hover:bg-yellow-50 transition-colors">
											<TableCell className="font-medium">{app.id}</TableCell>
											<TableCell>{app.name}</TableCell>
											<TableCell>{app.amount}</TableCell>
											<TableCell>{app.term}</TableCell>
											<TableCell className="hidden md:table-cell">{app.purpose}</TableCell>
											<TableCell>
												<div
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${app.status.toLowerCase() === "approved"
															? "bg-emerald-100 text-emerald-800"
															: app.status.toLowerCase() === "rejected"
																? "bg-red-100 text-red-800"
																: app.status.toLowerCase() === "disbursed"
																	? "bg-blue-100 text-blue-800"
																	: app.status.toLowerCase() === "completed"
																		? "bg-purple-100 text-purple-800"
																		: "bg-amber-100 text-amber-800"
														}`}
												>
													{app.status}
												</div>
											</TableCell>
											<TableCell className="hidden md:table-cell">{app.date}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													className="hover:bg-yellow-100 hover:text-yellow-800 transition-colors rounded-lg font-medium"
													onClick={() => handleViewApplication(app.id)}
												>
													View
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={8} className="h-32 text-center">
											<div className="flex flex-col items-center justify-center space-y-3 p-6">
												<div className="bg-yellow-50 p-3 rounded-full">
													<Search className="h-8 w-8 text-yellow-500" />
												</div>
												<p className="text-lg font-medium text-gray-800">No applications found</p>
												<p className="text-sm text-gray-500">
													Try adjusting your filters or create a new application
												</p>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
						<div className="text-sm text-muted-foreground">
							{totalItems > 0 ? (
								<>
									Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> results
								</>
							) : (
								"No results found"
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button
								className="rounded-full border-2 border-yellow-400 hover:bg-yellow-100 text-black"
								variant="outline"
								onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
								disabled={currentPage <= 1 || loading}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>
							
							{/* Page number indicator */}
							<div className="flex items-center space-x-1">
								{totalPages > 3 ? (
									<form onSubmit={handlePageJump} className="flex items-center space-x-1">
										<span className="text-sm">Page</span>
										<Input 
											type="number" 
											min={1} 
											max={totalPages}
											value={pageJumpInput} 
											onChange={(e) => setPageJumpInput(e.target.value)}
											className="w-12 h-7 text-center p-0" 
											placeholder={currentPage.toString()}
										/>
										<span className="text-sm">of {totalPages}</span>
										<Button type="submit" variant="outline" size="sm" className="h-7 px-2 py-0">
											Go
										</Button>
									</form>
								) : (
									<span className="text-sm px-3 py-0.5 rounded-md bg-yellow-50 border border-yellow-200">
										Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
									</span>
								)}
							</div>
							
							<Button
								className="rounded-full bg-yellow-400 hover:bg-yellow-500 text-black"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={loading || currentPage >= totalPages || applications.length === 0}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}


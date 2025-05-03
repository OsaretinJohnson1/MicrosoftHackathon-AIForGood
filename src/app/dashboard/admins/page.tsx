"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Check, 
  EyeIcon, 
  PencilIcon, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Search, 
  Shield, 
  UserCog, 
  UserPlus,
  Download,
  Filter,
  X, 
  ChevronDown
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Admin {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  roleId: number
  isAdmin: number
  lastLogin: string | null
  logins: number
  signupDate: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalAdmins: number
}

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [useRawSQL, setUseRawSQL] = useState(true)  // Default to raw SQL
  const [sortOptions, setSortOptions] = useState({
    field: 'id',
    direction: 'desc' as 'asc' | 'desc'
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalAdmins: 0
  })

  // Helper function to normalize admin data from any API response structure
  const normalizeAdminData = (data: any) => {
    if (!data || !data.admins) {
      console.error('Invalid data structure - missing admins array')
      return []
    }

    let normalizedAdmins = data.admins

    // Handle nested arrays
    if (Array.isArray(data.admins) && data.admins.length > 0 && Array.isArray(data.admins[0])) {
      normalizedAdmins = data.admins[0]
      console.log('Flattened nested admin array structure')
    }

    // Verify each item has the required properties
    return normalizedAdmins.map((admin: any, index: number) => {
      if (!admin) return null
      
      // Create a normalized admin object with defaults for missing properties
      return {
        id: admin.id || index,
        firstname: admin.firstname || 'Unknown',
        lastname: admin.lastname || 'User',
        email: admin.email || 'No email',
        phone: admin.phone || 'No phone',
        roleId: admin.roleId || 0, 
        isAdmin: typeof admin.isAdmin === 'number' ? admin.isAdmin : 0,
        lastLogin: admin.lastLogin,
        logins: admin.logins || 0,
        signupDate: admin.signupDate || new Date().toISOString()
      }
    }).filter(Boolean) // Remove any null entries
  }

  // Fetch admin users with pagination
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true)
        console.log('Fetching admins with params:', {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: searchQuery,
          useRawSQL
        })
        
        // Use raw SQL endpoint if enabled, otherwise use ORM endpoint
        const endpoint = useRawSQL ? 'raw-list' : 'list'
        const url = `/api/admin/${endpoint}?page=${pagination.currentPage}&pageSize=${pagination.pageSize}${searchQuery ? `&search=${searchQuery}` : ''}&sortField=${sortOptions.field}&sortDirection=${sortOptions.direction}`
        console.log('Request URL:', url)
        
        const response = await fetch(url)
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(`Failed to fetch admin users: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        console.log('Response data:', data)
        
        // Normalize the admin data to handle any structure issues
        const normalizedAdmins = normalizeAdminData(data)
        console.log('Normalized admins:', normalizedAdmins)
        
        setAdmins(normalizedAdmins)
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          pageSize: data.pagination?.pageSize || 10,
          totalAdmins: data.pagination?.totalAdmins || 0
        })
      } catch (error) {
        console.error('Error fetching admin users:', error)
        setError(`Failed to load admin users: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdmins()
  }, [pagination.currentPage, pagination.pageSize, searchQuery, useRawSQL, sortOptions])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }))
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
  }

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(value),
      currentPage: 1 // Reset to first page when changing page size
    }))
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc'
    setSortOptions({
      field,
      direction
    })
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
  }
  
  // Get admin type name based on isAdmin value
  const getAdminTypeName = (isAdmin: number) => {
    switch (isAdmin) {
      case 1:
        return "Admin"
      case 2:
        return "Super Admin"
      default:
        return "Unknown Role"
    }
  }

  // Format admin data for display
  const formatAdminData = (admin: Admin) => {
    const fullName = `${admin.firstname} ${admin.lastname}`
    
    // Format last login date
    let lastLoginDate = "Never"
    if (admin.lastLogin) {
      const date = new Date(admin.lastLogin)
      lastLoginDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    // Format signup date
    let signupDate = "N/A"
    if (admin.signupDate) {
      const date = new Date(admin.signupDate)
      signupDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return {
      id: `ADMIN-${admin.id.toString().padStart(4, '0')}`,
      name: fullName,
      email: admin.email,
      phone: admin.phone || "N/A", 
      adminType: getAdminTypeName(admin.isAdmin),
      isAdmin: admin.isAdmin,
      lastLogin: lastLoginDate,
      signupDate: signupDate,
      logins: admin.logins
    }
  }

  // Process admins data for display
  const formattedAdmins = admins.map(formatAdminData)

  // Test API endpoints directly
  const testAdminList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/list?page=1&pageSize=10')
      const result = await response.json()
      console.log('Direct admin list API test result:', result)
      
      // Check data structure
      let dataStructureInfo = 'No admins found'
      if (result.admins && result.admins.length > 0) {
        const sample = result.admins[0]
        dataStructureInfo = `Sample: ${JSON.stringify(sample).substring(0, 100)}...\n`
        dataStructureInfo += `isAdmin value: ${sample.isAdmin}`
      }
      
      alert(`Admin list test: ${response.status === 200 ? 'Success' : 'Failed'}\n` +
             `Found ${result.admins?.length || 0} admins\n` +
             dataStructureInfo)
    } catch (error) {
      console.error('Test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdminAPI = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/test')
      const result = await response.json()
      console.log('API test result:', result)
      alert(`API test: ${response.status === 200 ? 'Success' : 'Failed'}\nSession: ${result.session ? 'Authenticated' : 'Not authenticated'}`)
    } catch (error) {
      console.error('Test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testRawAdminList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/raw-list?page=1&pageSize=10')
      const result = await response.json()
      console.log('Raw SQL admin list API test result:', result)
      
      // Check data structure
      let dataStructureInfo = 'No admins found'
      if (result.admins && result.admins.length > 0) {
        const sample = result.admins[0]
        dataStructureInfo = `Sample: ${JSON.stringify(sample).substring(0, 100)}...\n`
        dataStructureInfo += `isAdmin value: ${sample.isAdmin}`
      }
      
      alert(`Raw SQL admin list test: ${response.status === 200 ? 'Success' : 'Failed'}\n` +
             `Found ${result.admins?.length || 0} admins\n` +
             dataStructureInfo)
    } catch (error) {
      console.error('Test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    // Reset search
    setSearchQuery("")
    
    // Reset sorting to default
    setSortOptions({
      field: 'id',
      direction: 'desc'
    })
    
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
    
    // Fetch fresh data
    toast.success("Refreshing data", {
      description: "Loading latest administrators data"
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          <Shield className="h-8 w-8 text-primary" />
          Administrators
        </h2>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border border-gray-200 hover:bg-gray-50/80 transition-all duration-200 rounded-lg px-4">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Admin Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => {}}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    All Admins
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                    Regular Admins
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    Super Admins
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
                <DropdownMenuItem onClick={() => handleSortChange('signupDate')}>
                  Oldest First
                  {sortOptions.field === 'signupDate' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('firstname')}>
                  Name (A-Z)
                  {sortOptions.field === 'firstname' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('firstname')}>
                  Name (Z-A)
                  {sortOptions.field === 'firstname' && sortOptions.direction === 'desc' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* <Button onClick={() => setUseRawSQL(!useRawSQL)} variant="outline" size="sm" className="border border-gray-200 hover:bg-gray-50/80 transition-all duration-200 rounded-lg px-4">
            {useRawSQL ? "Using: Raw SQL" : "Using: ORM"}
          </Button> */}
          
          <Button onClick={() => router.push('/dashboard/admins/new')} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg rounded-lg px-4">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
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
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Administrator Management
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage system administrators and their access roles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search administrators..." 
                    className="pl-10 w-[320px] border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e)
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
{/*               
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground mr-2">Rows per page:</span>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pagination.pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            {/* <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">API Test Tools:</div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={testAdminAPI} variant="outline" className="gap-1">
                  Test API
                </Button>
                <Button onClick={testAdminList} variant="outline" className="gap-1">
                  Test List API
                </Button>
                <Button onClick={testRawAdminList} variant="outline" className="gap-1">
                  Test Raw SQL
                </Button>
              </div>
            </div> */}

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('id')}>
                        ID
                        {sortOptions.field === 'id' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('firstname')}>
                        Name
                        {sortOptions.field === 'firstname' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('email')}>
                        Email
                        {sortOptions.field === 'email' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('phone')}>
                        Phone
                        {sortOptions.field === 'phone' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('isAdmin')}>
                        Admin Type
                        {sortOptions.field === 'isAdmin' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('lastLogin')}>
                        Last Login
                        {sortOptions.field === 'lastLogin' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('signupDate')}>
                        Joined
                        {sortOptions.field === 'signupDate' && sortOptions.direction === 'asc' && <span className="ml-auto">✓</span>}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                          <p className="text-sm text-muted-foreground">Loading administrators...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <p className="text-lg font-medium text-red-500">Error loading administrators</p>
                          <p className="text-sm text-muted-foreground">{error}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRefresh}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : formattedAdmins.length > 0 ? (
                    formattedAdmins.map((admin, index) => (
                      <motion.tr
                        key={admin.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">{admin.id}</TableCell>
                        <TableCell className="font-medium text-gray-800">{admin.name}</TableCell>
                        <TableCell className="text-gray-600">{admin.email}</TableCell>
                        <TableCell className="text-gray-600">{admin.phone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={admin.isAdmin === 2 ? "secondary" : "default"}
                            className="gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            {admin.adminType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{admin.lastLogin}</TableCell>
                        <TableCell className="text-gray-600">{admin.signupDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/admins/${admin.id}`)}
                              title="View Details"
                              className="hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-full"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/admins/edit/${admin.id}`)}
                              title="Edit Admin"
                              className="hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-full"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-indigo-500 opacity-40" />
                          <p className="text-lg font-medium">No administrators found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try adjusting your search query" : "Add a new admin to get started"}
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
                Showing <strong>{formattedAdmins.length}</strong> of <strong>{pagination.totalAdmins}</strong> administrators
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={() => handlePageChange(Math.max(pagination.currentPage - 1, 1))}
                  disabled={pagination.currentPage <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="mx-2 text-sm">
                  Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-2 hover:bg-muted/50 transition-colors"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages || loading}
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
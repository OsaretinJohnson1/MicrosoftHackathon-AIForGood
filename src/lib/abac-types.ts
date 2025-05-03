export type NavItem = {
    title: string
    href: string
    icon: string
    permission: string
    isActive?: boolean
    exact?: boolean
    pattern?: RegExp
}
export type BillingSection = {
    name: string
    title: string
    value: number
    change: string
    icon: string
}
export type Metric = {
    name: string
    title: string
    value: number
    change: string
    icon: string
}
export type MetricChart = {
    name: string
    title: string
    value: number
    change: string
    icon: string
}
export type ActivityChart = {
    name: string
    title: string
    value: number
    change: string
    icon: string
}
export type Expenditure = {
    name: string
    title: string
    value: number
    change: string
    icon: string
}
export type MapComponent = {
    id: string
    name: string
    description: string
}
export type Comment = {
    id: string|number
    body: string
    addedBy: string|number
    createdAt: Date
}

export type Blog = {
    id: string|number
    title: string
    addedBy: string|number
    completed: boolean
    invitedUsers: (string|number)[]
}

export type User = {
    uid: string|number
    firstname: string
    lastname: string
    profilePic: string
    roles: string[]
    myGroups: any[]
    blockedBy: (string|number)[]

    accessToken: string
    access_token: string
    refreshToken: string
    refresh_token: string
}

export type Role = "super" | "admin" | "subAdmin" | "representative" | "manager" | "subManager" | "user" | "driver"
export type PermissionCheck<Key extends keyof Permissions> =
    | boolean
    | ((user: User, data: Permissions[Key]["dataType"]) => boolean)

export type RolesWithPermissions = {
    [R in Role]: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
        }>
    }>
}

export type Permissions = {
    'quotation-nav': {
        dataType: NavItem
        action: "view"
    },
    'profile-nav': {
        dataType: NavItem
        action: "view"
    }
    'dashboard': {
        dataType: NavItem
        action: "view"
    }
    'metrics-nav': {
        dataType: NavItem
        action: "view"
    }
    'maps-nav': {
        dataType: NavItem
        action: "view"
    }
    'blog-nav': {
        dataType: NavItem
        action: "view"
    }
    'communications-nav': {
        dataType: NavItem
        action: "view"
    }
    'users-nav': {
        dataType: NavItem
        action: "view"
    }
    'orgs-nav': {
        dataType: NavItem
        action: "view"
    }
    'products-nav': {
        dataType: NavItem
        action: "view"
    }
    'invoices-nav': {
        dataType: NavItem
        action: "view"
    }
    'billing-nav': {
        dataType: NavItem
        action: "view"
    }
    billingSection: {
        dataType: BillingSection
        action: "view"
    }
    metricsSection: {
        dataType: Metric
        action: "view"
    }
    metricCharts: {
        dataType: MetricChart
        action: "view"
    }
    activitySection: {
        dataType: ActivityChart
        action: "view"
    }
    expenditures: {
        dataType: Expenditure
        action: "view"
    }
    maps: {
        dataType: MapComponent
        action: "view" | "create" | "update" | "delete"
    }
    comments: {
        dataType: Comment
        action: "view" | "create" | "update"
    }
    blogs: {
        // Can do something like Pick<Blog, "addedBy"> to get just the rows you use
        dataType: Blog
        action: "view" | "create" | "update" | "delete"
    }
    invoices: {
        dataType: any,
        action: "view" | "create" | "update" | "delete" | "share" | "print"
    }
    quotations: {
        dataType: any,
        action: "view" | "create" | "update" | "delete" | "share" | "print"
    }
    invoice_templates: {
        dataType: any
        action: "view" | "create" | "update" | "delete"
    }
    credits: {
        dataType: any
        action: "view" | "create" | "update" | "delete"
    }
    'orgs': {
        dataType: any
        action: "view" | "create" | "update" | "delete"
    }
}

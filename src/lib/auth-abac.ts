import { Blog, Permissions, RolesWithPermissions, User } from "./abac-types"

const ADMIN_ROLES = [
    'super', 'admin', 'subAdmin', 'representative'
];
const ROLES = {
    super: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        'metrics-nav': { view: true }, 
        'maps-nav': { view: true }, 
        'blog-nav': { view: true }, 
        'communications-nav': { view: true }, 
        'orgs-nav': { view: true }, 
        'products-nav': { view: true }, 
        'users-nav': { view: true }, 
        'invoices-nav': { view: true }, 
        'quotation-nav': { view: true },
        quotations: { view: true, create: true, update: true, delete: true, share: true }, 
        invoices: { view: true, create: true, update: true, delete: true, share: true }, 
        invoice_templates: { view: true, create: true, update: true, delete: true }, 
        credits: { create: true, view: true, update: true, delete: true }, 
        metricCharts: { view: true }, 
        metricsSection: { view: true }, 
        activitySection: { view: true }, 
        expenditures: { view: true }, 
        comments: { view: true, create: true, update: true }, 
        blogs: { view: true, create: true, update: true, delete: true },
        'orgs': { view: true, create: true, update: true, delete: true}
    },
    admin: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        'metrics-nav': { view: true }, 
        'maps-nav': { view: true }, 
        'blog-nav': { view: true }, 
        'communications-nav': { view: true }, 
        'orgs-nav': { view: true }, 
        'products-nav': { view: true }, 
        'users-nav': { view: true }, 
        'invoices-nav': { view: true }, 
        'quotation-nav': { view: true },
        invoices: { view: true, create: true, update: true, delete: true, share: true }, 
        invoice_templates: { view: true, create: true, update: true, delete: true }, 
        credits: { create: true, view: true, update: true, delete: true }, 
        metricCharts: { view: true }, 
        metricsSection: { view: true }, 
        activitySection: { view: true }, expenditures: { view: true }, comments: { view: true, create: true, update: true }, blogs: { view: true, create: true, update: true, delete: true },  'orgs': { view: true, create: true, update: true, delete: true} },
    subAdmin: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        'metrics-nav': { view: true }, 
        'maps-nav': { view: true }, 
        'blog-nav': { view: true }, 
        'communications-nav': { view: true }, 
        'orgs-nav': { view: true }, 
        'invoices-nav': { view: true }, 
        'quotation-nav': { view: true },
        credits: { view: true}, 
        comments: { view: true, create: true, update: true }, blogs: { view: true, create: true, update: true }, 'orgs': { view: true, create: true, update: true, delete: true} },
    representative: {
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        'communications-nav': { view: true }, 
        'blog-nav': { view: true }, 
        comments: { view: true, create: true, update: true }, 
        blogs: { view: true, create: true, update: true }, 
        'orgs': { view: true, create: true, update: true} 
    },
    manager: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        'orgs-nav': { view: true }, 
        'products-nav': { view: true }, 
        'billing-nav': { view: true }, 
        'invoices-nav': { view: true },
        'quotation-nav': { view: true },
        credits: { view: true }, 
        expenditures: { view: true }, 
        billingSection: { view: true }, 
        comments: { view: true, create: true }, 
        blogs: { view: true, create: true}, 
        'orgs': { view: true, create: true, update: true, delete: true} 
    },
    subManager: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 'quotation-nav': { view: true },
        comments: { view: true, create: true }, 
        blogs: { view: true, create: true } },
    driver: { 'dashboard': { view: true }, comments: { view: true, create: true }, blogs: { view: true, create: true }, 'orgs': { create: true  } },
    user: { 
        'profile-nav': { view: true }, 'dashboard': { view: true }, 
        comments: { 
            view: (user, comment) => !user.blockedBy.includes(comment.addedBy), 
            create: true, 
            update: (user, comment) => comment.addedBy === user.uid 
        }, 
        blogs: { 
            view: (user: User, blog: Blog) => !user.blockedBy.includes(blog.addedBy), 
            create: true, update: (user: User, blog: Blog) => blog.addedBy === user.uid || blog.invitedUsers.includes(user.uid), 
            delete: (user: User, blog: Blog) => (blog.addedBy === user.uid || blog.invitedUsers.includes(user.uid)) && blog.completed 
        },
        'orgs': { create: true  }
    }
}  as const satisfies RolesWithPermissions;

export function isAdmin(user: User) {
    if (!user) {
        return null;
    }
    return user.roles.some(role => ADMIN_ROLES.includes(role));
}
export function hasPermission<Resource extends keyof Permissions>(
    user: User,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
) {
    if (!user) {
        return null;
    }
    return user.roles.some((role: any) => {
        const permission = (ROLES as RolesWithPermissions)[(role as keyof typeof ROLES)][resource]?.[action]
        if (permission == null) return false

        if (typeof permission === "boolean") return permission
        return data != null && permission(user, data)
    });
}
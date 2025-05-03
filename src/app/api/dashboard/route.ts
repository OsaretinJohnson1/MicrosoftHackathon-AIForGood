import { NextResponse } from 'next/server';
import { db } from '../../../database/db';
import { applications, transactions, users, dashboardMetrics, loanTypes, loanTypePerformance, loanStatusDistribution } from "../../../database/ubuntu-lend/schema";
import { eq, sql, desc, gte, lte, and, or, like, count, sum, avg } from 'drizzle-orm';
import { getUserByField, queryWithConditions, getAllUsers } from '../../../lib/utils';

export async function GET() {
  try {
    // Get latest dashboard metrics
    const latestMetricsDate = await db.select({ date: sql`MAX(${dashboardMetrics.metricDate})` }).from(dashboardMetrics);
    const latestDateValue = latestMetricsDate[0]?.date || new Date().toISOString().split('T')[0];
    
    // Using queryWithConditions instead of direct query for metrics
    const metricsCondition = sql`${dashboardMetrics.metricDate} = ${latestDateValue}`;
    const metrics = await queryWithConditions(dashboardMetrics, metricsCondition, { limit: 1 });
    
    // If no metrics found in the table, calculate on the fly
    let dashboardData;
    
    if (metrics.length === 0) {
      // Count of active loans - using queryWithConditions utility
      const approvedCondition = sql`${applications.status} = 'approved'`;
      const activeLoansResult = await db.select({
        count: count(),
        totalAmount: sql<string>`SUM(${applications.loanAmount})`
      }).from(applications)
      .where(approvedCondition);
      
      // Count of pending applications - using queryWithConditions utility
      const pendingCondition = sql`${applications.status} = 'pending'`;
      const pendingApps = await queryWithConditions(applications, pendingCondition);
      const pendingApplicationsCount = pendingApps.length;
      
      // Count of rejected loans - using queryWithConditions utility
      const rejectedCondition = sql`${applications.status} = 'rejected'`;
      const rejectedApps = await queryWithConditions(applications, rejectedCondition);
      const rejectedLoansCount = rejectedApps.length;
      
      // Total loans
      const totalLoansResult = await db.select({
        count: count(),
        totalAmount: sql<string>`SUM(${applications.loanAmount})`
      }).from(applications);
      
      dashboardData = {
        totalLoansAmount: totalLoansResult[0]?.totalAmount || '0',
        totalLoansCount: totalLoansResult[0]?.count || 0,
        activeLoansCount: activeLoansResult[0]?.count || 0,
        activeLoansAmount: activeLoansResult[0]?.totalAmount || '0',
        pendingApplicationsCount: pendingApplicationsCount,
        rejectedLoansCount: rejectedLoansCount,
      };
    } else {
      dashboardData = metrics[0];
    }
    
    // Get loan type distribution
    const loanTypeDistribution = await db.select({
      id: loanTypes.id,
      name: loanTypes.name,
      count: count(applications.id),
      totalAmount: sql<string>`SUM(${applications.loanAmount})`,
      percentage: sql<string>`ROUND((COUNT(${applications.id}) * 100.0 / (SELECT COUNT(*) FROM ${applications})), 2)`
    })
    .from(loanTypes)
    .leftJoin(applications, eq(applications.loanTypeId, loanTypes.id))
    .groupBy(loanTypes.id, loanTypes.name);
    
    // Get loan status distribution
    const statusDistribution = await db.select({
      status: applications.status,
      count: count(),
      totalAmount: sql<string>`SUM(${applications.loanAmount})`,
      percentage: sql<string>`ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${applications})), 2)`
    })
    .from(applications)
    .groupBy(applications.status);
    
    // Get recent applications with user data
    // First get applications using direct query
    const recentApps = await db.select({
      id: applications.id,
      userId: applications.userId,
      amount: applications.loanAmount,
      term: applications.loanTermMonths,
      purpose: applications.purpose,
      status: applications.status,
      date: applications.applicationDate,
    })
    .from(applications)
    .orderBy(desc(applications.applicationDate))
    .limit(5);
    
    // Then get user data for each application and format results
    const formattedRecentApplications = await Promise.all(
      recentApps.map(async (app: any) => {
        // Using getUserByField to get user data
        const userData = await getUserByField('id', app.userId, users, { limit: 1 });
        
        // Handle userData properly with type checking
        const firstName = userData && typeof userData === 'object' && 'firstname' in userData 
          ? userData.firstname 
          : 'Unknown';
        const lastName = userData && typeof userData === 'object' && 'lastname' in userData 
          ? userData.lastname 
          : 'User';
        
        return {
          id: `APP-${app.id}`,
          name: `${firstName} ${lastName}`,
          amount: `$${Number(app.amount).toLocaleString()}`,
          term: `${app.term} months`,
          purpose: app.purpose || 'Not specified',
          status: app.status,
          date: new Date(app.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric'
          })
        };
      })
    );
    
    // Monthly performance for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Using SQL directly for monthly performance as it's a complex aggregation
    const dateCondition = sql`${applications.applicationDate} >= ${sixMonthsAgo.toISOString()}`;
    const monthlyPerformance = await db.select({
      month: sql<string>`DATE_FORMAT(${applications.applicationDate}, '%Y-%m')`,
      disbursed: sql<string>`SUM(CASE WHEN ${applications.status} = 'approved' THEN ${applications.loanAmount} ELSE 0 END)`,
      count: count(applications.id)
    })
    .from(applications)
    .where(dateCondition)
    .groupBy(sql`DATE_FORMAT(${applications.applicationDate}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${applications.applicationDate}, '%Y-%m')`);
    
    return NextResponse.json({
      metrics: dashboardData,
      loanTypeDistribution,
      statusDistribution,
      recentApplications: formattedRecentApplications,
      monthlyPerformance
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 
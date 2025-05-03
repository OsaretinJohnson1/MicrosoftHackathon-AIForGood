export interface DashboardMetrics {
  totalLoansAmount: string;
  totalLoansCount: number;
  activeLoansCount: number;
  activeLoansAmount: string;
  pendingApplicationsCount: number;
  rejectedLoansCount: number;
  overdueLoansCount?: number;
  overdueLoansAmount?: string;
  newCustomersCount?: number;
  disbursedAmountDaily?: string;
  repaymentAmountDaily?: string;
}

export interface LoanTypeDistribution {
  id: number;
  name: string;
  count: number;
  totalAmount: string;
  percentage: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  totalAmount: string;
  percentage: string;
}

export interface RecentApplication {
  id: string;
  name: string;
  amount: string;
  term: string;
  purpose: string;
  status: string;
  date: string;
}

export interface MonthlyPerformance {
  month: string;
  disbursed: string;
  count: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  loanTypeDistribution: LoanTypeDistribution[];
  statusDistribution: StatusDistribution[];
  recentApplications: RecentApplication[];
  monthlyPerformance: MonthlyPerformance[];
} 
import { researchService } from './researchService';
import { usersService } from './users.service';
import articlesService from './articlesService';
import activityLogsService, { ActivityLog } from './activity-logs.service';

/**
 * Dashboard Statistics Service
 * Aggregates data from multiple backend endpoints for admin dashboard
 */

// ============================================
// Types
// ============================================

export interface DashboardStats {
  // Research Stats
  totalResearch: number;
  underReview: number;
  accepted: number;
  needsRevision: number;
  rejected: number;
  published: number;

  // User Stats
  totalUsers: number;
  activeResearchers: number;
  reviewers: number;
  editors: number;
  admins: number;

  // Article Stats
  totalArticles: number;
  publishedArticles: number;
  readyToPublish: number;
  totalViews: number;
  totalDownloads: number;
  totalCitations: number;

  // Activity Stats
  totalActivities: number;
  todayActivities: number;
}

export interface MonthlySubmission {
  month: string;
  submitted: number;
  published: number;
}

export interface ResearchDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for recharts compatibility
}

export interface DashboardData {
  stats: DashboardStats;
  monthlySubmissions: MonthlySubmission[];
  researchDistribution: ResearchDistribution[];
  recentActivities: ActivityLog[];
}

export interface ReportsStats {
  acceptanceRate: number; // معدل القبول %
  rejectionRate: number; // معدل الرفض %
  averageReviewTime: number; // متوسط وقت المراجعة (أيام)
  totalSubmissions: number; // إجمالي التقديمات
  publishedResearch: number; // الأبحاث المنشورة
  pendingReview: number; // قيد المراجعة
  needsRevision: number; // تحتاج تعديلات
}

export interface MonthlyReviewTime {
  month: string;
  days: number;
}

export interface MonthlyProductivity {
  month: string;
  value: number;
}

export interface ReportsData {
  stats: ReportsStats;
  monthlyReviewTime: MonthlyReviewTime[];
  monthlyProductivity: MonthlyProductivity[];
}

// ============================================
// Dashboard Service
// ============================================

export const dashboardService = {
  /**
   * Get comprehensive dashboard statistics
   * Aggregates data from multiple endpoints
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all stats in parallel for better performance
      const [researchStats, userStats, articleStats, activityStats] = await Promise.all([
        researchService.getStats(),
        usersService.getStats(),
        articlesService.getStats(),
        activityLogsService.getStats(),
      ]);

      return {
        // Research Stats
        totalResearch: researchStats.total,
        underReview: researchStats.under_review,
        accepted: researchStats.accepted,
        needsRevision: researchStats.needs_revision,
        rejected: researchStats.rejected,
        published: researchStats.published,

        // User Stats
        totalUsers: userStats.total,
        activeResearchers: userStats.researchers,
        reviewers: userStats.reviewers,
        editors: userStats.editors,
        admins: userStats.admins,

        // Article Stats
        totalArticles: articleStats.totalArticles,
        publishedArticles: articleStats.publishedArticles,
        readyToPublish: articleStats.readyToPublish,
        totalViews: articleStats.totalViews,
        totalDownloads: articleStats.totalDownloads,
        totalCitations: articleStats.totalCitations,

        // Activity Stats
        totalActivities: activityStats.total,
        todayActivities: activityStats.today,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get monthly submissions data for the last 6 months
   * This fetches all research and groups by month
   */
  async getMonthlySubmissions(): Promise<MonthlySubmission[]> {
    try {
      // Fetch all research
      const allResearch = await researchService.getAll();

      // Get last 6 months
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const currentDate = new Date();
      const monthlyData: MonthlySubmission[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Count submitted research in this month
        const submitted = allResearch.filter((r) => {
          const submissionDate = new Date(r.submission_date);
          return (
            submissionDate.getMonth() === monthIndex &&
            submissionDate.getFullYear() === year
          );
        }).length;

        // Count published research in this month
        const published = allResearch.filter((r) => {
          if (!r.published_date) return false;
          const publishedDate = new Date(r.published_date);
          return (
            publishedDate.getMonth() === monthIndex &&
            publishedDate.getFullYear() === year
          );
        }).length;

        monthlyData.push({
          month: months[monthIndex],
          submitted,
          published,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly submissions:', error);
      // Return empty data on error
      return [];
    }
  },

  /**
   * Get research distribution for pie chart
   */
  async getResearchDistribution(): Promise<ResearchDistribution[]> {
    try {
      const stats = await researchService.getStats();

      return [
        { name: 'قيد المراجعة', value: stats.under_review, color: '#3b82f6' },
        { name: 'تعديلات مطلوبة', value: stats.needs_revision, color: '#eab308' },
        { name: 'مرفوض', value: stats.rejected, color: '#ef4444' },
        { name: 'مقبول', value: stats.accepted, color: '#22c55e' },
      ];
    } catch (error) {
      console.error('Error fetching research distribution:', error);
      return [];
    }
  },

  /**
   * Get recent activity logs
   */
  async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const activities = await activityLogsService.getAll({ limit });
      return activities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  /**
   * Get all dashboard data in one call
   * This is the main method to use in the dashboard component
   */
  async getAllDashboardData(): Promise<DashboardData> {
    try {
      // Fetch all data in parallel
      const [stats, monthlySubmissions, researchDistribution, recentActivities] =
        await Promise.all([
          this.getDashboardStats(),
          this.getMonthlySubmissions(),
          this.getResearchDistribution(),
          this.getRecentActivities(10),
        ]);

      return {
        stats,
        monthlySubmissions,
        researchDistribution,
        recentActivities,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // ============================================
  // Reports & Statistics Methods
  // ============================================

  /**
   * Get reports statistics
   * Calculates acceptance rate, rejection rate, etc.
   */
  async getReportsStats(): Promise<ReportsStats> {
    try {
      const researchStats = await researchService.getStats();

      // Calculate rates
      const total = researchStats.total;
      const acceptanceRate = total > 0 ? Math.round((researchStats.accepted / total) * 100) : 0;
      const rejectionRate = total > 0 ? Math.round((researchStats.rejected / total) * 100) : 0;

      // Average review time (mock for now - can be enhanced)
      const averageReviewTime = 9;

      return {
        acceptanceRate,
        rejectionRate,
        averageReviewTime,
        totalSubmissions: total,
        publishedResearch: researchStats.published,
        pendingReview: researchStats.under_review,
        needsRevision: researchStats.needs_revision,
      };
    } catch (error) {
      console.error('Error fetching reports stats:', error);
      throw error;
    }
  },

  /**
   * Get monthly review time data
   * Calculates average review time per month for last 6 months
   */
  async getMonthlyReviewTime(): Promise<MonthlyReviewTime[]> {
    try {
      // Fetch all research
      const allResearch = await researchService.getAll();

      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const currentDate = new Date();
      const monthlyData: MonthlyReviewTime[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Filter research for this month
        const monthResearch = allResearch.filter((r) => {
          const submissionDate = new Date(r.submission_date);
          return (
            submissionDate.getMonth() === monthIndex &&
            submissionDate.getFullYear() === year
          );
        });

        // Calculate average review time for this month
        let totalDays = 0;
        let count = 0;

        monthResearch.forEach((r) => {
          if (r.evaluation_date) {
            const submissionDate = new Date(r.submission_date);
            const evaluationDate = new Date(r.evaluation_date);
            const diffTime = Math.abs(evaluationDate.getTime() - submissionDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDays += diffDays;
            count++;
          }
        });

        const averageDays = count > 0 ? Math.round(totalDays / count) : 10; // Default 10 days if no data

        monthlyData.push({
          month: months[monthIndex],
          days: averageDays,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly review time:', error);
      // Return default data on error
      return [
        { month: 'يناير', days: 10 },
        { month: 'فبراير', days: 10 },
        { month: 'مارس', days: 10 },
        { month: 'أبريل', days: 10 },
        { month: 'مايو', days: 10 },
        { month: 'يونيو', days: 10 },
      ];
    }
  },

  /**
   * Get monthly productivity data
   * Shows number of published research per month
   */
  async getMonthlyProductivity(): Promise<MonthlyProductivity[]> {
    try {
      const allResearch = await researchService.getAll();

      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const currentDate = new Date();
      const monthlyData: MonthlyProductivity[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Count published research in this month
        const publishedCount = allResearch.filter((r) => {
          if (!r.published_date) return false;
          const publishedDate = new Date(r.published_date);
          return (
            publishedDate.getMonth() === monthIndex &&
            publishedDate.getFullYear() === year
          );
        }).length;

        monthlyData.push({
          month: months[monthIndex],
          value: publishedCount,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly productivity:', error);
      return [];
    }
  },

  /**
   * Get all reports data in one call
   * Main method for ReportsStatisticsPage
   */
  async getAllReportsData(): Promise<ReportsData> {
    try {
      const [stats, monthlyReviewTime, monthlyProductivity] = await Promise.all([
        this.getReportsStats(),
        this.getMonthlyReviewTime(),
        this.getMonthlyProductivity(),
      ]);

      return {
        stats,
        monthlyReviewTime,
        monthlyProductivity,
      };
    } catch (error) {
      console.error('Error fetching reports data:', error);
      throw error;
    }
  },
};

export default dashboardService;

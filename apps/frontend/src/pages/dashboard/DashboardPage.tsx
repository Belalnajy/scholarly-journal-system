import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { DashboardHomePage, ResearcherDashboard, ReviewerDashboard, EditorDashboard, AdminDashboard, ReviseResearchPage, MyTasksPage, EvaluationFormPage, CompletedResearchPage, ReviewerResearchViewPage, EditorResearchDetailsPage, EditorReviewDetailsPage, PendingRevisionDetailsPage, PendingDecisionPage, ManageResearchPage, ManageReviewersPage, ManageReportsPage, ManageIssuesPage, AddArticleToIssuePage, EditIssuePage, ViewIssueArticlesPage, ManageArticlesPage, ArticleDetailsPage, EditArticlePage, AssignReviewerPage, ManageUsersPage, AddUserPage, EditUserPage, ManageContactSubmissionsPage, ReportsStatisticsPage, NotificationsPage, ProfilePage, SettingsPage, SubmitResearchPage, MyResearchPage, ViewResearchPage, SiteSettingsPage } from './';
import { UserRole } from '../../types/user.types';
import { getNavigationByRole } from '../../data/dashboardNavigation';
import { useAuth } from '../../contexts';
import activityLogsService, { ActivityAction } from '../../services/activity-logs.service';

// Placeholder pages for role-specific pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
  </div>
);

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const navItems = getNavigationByRole(user.role);

  const handleLogout = async () => {
    // Save user ID before logout (because logout() will clear localStorage)
    const userId = user?.id;
    
    // Log activity before logout
    try {
      await activityLogsService.logUserAction(
        ActivityAction.USER_LOGOUT,
        `تسجيل خروج المستخدم`,
        undefined,
        userId // Pass userId explicitly
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }
    
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.RESEARCHER:
        return 'باحث';
      case UserRole.EDITOR:
        return 'محرر';
      case UserRole.REVIEWER:
        return 'محكم';
      case UserRole.ADMIN:
        return 'مدير';
      default:
        return 'مستخدم';
    }
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userInfo={{
        name: user.name,
        role: getRoleLabel(user.role),
        avatar: user.avatar_url || undefined,
      }}
      onLogout={handleLogout}
    >
      <Routes>
        {/* Home Route - Show role-specific dashboard */}
        <Route index element={
          user.role === UserRole.RESEARCHER ? <ResearcherDashboard /> :
          user.role === UserRole.REVIEWER ? <ReviewerDashboard /> :
          user.role === UserRole.EDITOR ? <EditorDashboard /> :
          user.role === UserRole.ADMIN ? <AdminDashboard /> :
          <DashboardHomePage />
        } />
        
        {/* Researcher Routes - Only for Researchers */}
        <Route path="submit-research" element={
          <ProtectedRoute allowedRoles={[UserRole.RESEARCHER]}>
            <SubmitResearchPage />
          </ProtectedRoute>
        } />
        <Route path="my-research" element={
          <ProtectedRoute allowedRoles={[UserRole.RESEARCHER]}>
            <MyResearchPage />
          </ProtectedRoute>
        } />
        <Route path="view-research/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.RESEARCHER]}>
            <ViewResearchPage /> 
          </ProtectedRoute>
        } />
        <Route path="revise-research/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.RESEARCHER]}>
            <ReviseResearchPage />
          </ProtectedRoute>
        } />
        {/* Role-specific dashboard routes */}
        <Route path="researcher" element={
          <ProtectedRoute allowedRoles={[UserRole.RESEARCHER]}>
            <ResearcherDashboard />
          </ProtectedRoute>
        } />
        <Route path="reviewer" element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        <Route path="editor" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR]}>
            <EditorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Editor & Admin Routes */}
        <Route path="manage-research" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ManageResearchPage />
          </ProtectedRoute>
        } />
        <Route path="research-details/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <EditorResearchDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="pending-revision/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <PendingRevisionDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="pending-decision/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <PendingDecisionPage />
          </ProtectedRoute>
        } />
        <Route path="assign-reviewer" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <AssignReviewerPage />
          </ProtectedRoute>
        } />
        <Route path="assign-reviewer/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <AssignReviewerPage />
          </ProtectedRoute>
        } />
        <Route path="manage-reviewers" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ManageReviewersPage />
          </ProtectedRoute>
        } />
        <Route path="manage-issues" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ManageIssuesPage />
          </ProtectedRoute>
        } />
        <Route path="issues/:issueId/add-article" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <AddArticleToIssuePage />
          </ProtectedRoute>
        } />
        <Route path="issues/:issueId/edit" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <EditIssuePage />
          </ProtectedRoute>
        } />
        <Route path="issues/:issueId/articles" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ViewIssueArticlesPage />
          </ProtectedRoute>
        } />
        <Route path="manage-reports" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ManageReportsPage />
          </ProtectedRoute>
        } />
        <Route path="manage-articles" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ManageArticlesPage />
          </ProtectedRoute>
        } />
        <Route path="articles/:articleId" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <ArticleDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="articles/:articleId/edit" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <EditArticlePage />
          </ProtectedRoute>
        } />
        
        {/* Reviewer Routes - Only for Reviewers */}
        <Route path="my-tasks" element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <MyTasksPage />
          </ProtectedRoute>
        } />
        <Route path="evaluation-form/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <EvaluationFormPage />
          </ProtectedRoute>
        } />
        <Route path="completed-research" element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <CompletedResearchPage />
          </ProtectedRoute>
        } />
        <Route path="reviewer-research-view/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <ReviewerResearchViewPage />
          </ProtectedRoute>
        } />
        <Route path="review-details/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <EditorReviewDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="editor-review-details/:id" element={
          <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
            <EditorReviewDetailsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes - Only for Admin */}
        <Route path="manage-users" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ManageUsersPage />
          </ProtectedRoute>
        } />
        <Route path="manage-users/add" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AddUserPage />
          </ProtectedRoute>
        } />
        <Route path="manage-users/:id/edit" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditUserPage />
          </ProtectedRoute>
        } />
        <Route path="manage-contact-submissions" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ManageContactSubmissionsPage />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ReportsStatisticsPage />
          </ProtectedRoute>
        } />
        <Route path="site-settings" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <SiteSettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Common Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}

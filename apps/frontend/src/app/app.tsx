import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { ScrollToTop, ProtectedRoute } from '../components/common';
import { PublicRoute } from '../components/PublicRoute';
import { MaintenanceGuard } from '../components/MaintenanceGuard';
import { FloatingWhatsAppButton } from '../components/FloatingWhatsAppButton';
import { AuthProvider, SiteSettingsProvider } from '../contexts';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then(m => ({ default: m.AboutPage })));
const TeamPage = lazy(() => import('../pages/TeamPage').then(m => ({ default: m.TeamPage })));
const IssuesArchivePage = lazy(() => import('../pages/IssuesArchivePage').then(m => ({ default: m.IssuesArchivePage })));
const IssueDetailsPage = lazy(() => import('../pages/IssueDetailsPage').then(m => ({ default: m.IssueDetailsPage })));
const ResearchDetailsPage = lazy(() => import('../pages/ResearchDetailsPage').then(m => ({ default: m.ResearchDetailsPage })));
const ArticlePublicPage = lazy(() => import('../pages/ArticlePublicPage').then(m => ({ default: m.ArticlePublicPage })));
const VerifyArticlePage = lazy(() => import('../pages/VerifyArticlePage').then(m => ({ default: m.VerifyArticlePage })));
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsAndConditionsPage = lazy(() => import('../pages/TermsAndConditionsPage').then(m => ({ default: m.TermsAndConditionsPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegistrationPage = lazy(() => import('../pages/RegistrationPage').then(m => ({ default: m.RegistrationPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const VerifyCodePage = lazy(() => import('../pages/VerifyCodePage').then(m => ({ default: m.VerifyCodePage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MaintenancePage = lazy(() => import('../pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
import {
  navLinks,
  footerLinks,
  socialLinks,
  contactInfo,
  siteInfo,
} from '../data/demoData';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#093059]"></div>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
      <div className="min-h-screen bg-white">
        <ScrollToTop />
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Maintenance Page - No guard needed, always accessible */}
        <Route path="/maintenance" element={<MaintenancePage />} />
        
        {/* Auth pages without header and footer - Redirect to dashboard if already logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegistrationPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/verify-code" element={
          <PublicRoute>
            <VerifyCodePage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        
        {/* Dashboard pages without header and footer - Protected */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* All other pages with header and footer - Protected by MaintenanceGuard */}
        <Route
          path="/*"
          element={
            <MaintenanceGuard>
              <Header navigation={navLinks} />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                {/* Editorial route removed - using /team instead */}
                <Route path="/team" element={<TeamPage />} />
                <Route path="/issues" element={<IssuesArchivePage />} />
                <Route path="/issues/:id" element={<IssueDetailsPage />} />
                <Route path="/research/:id" element={<ResearchDetailsPage />} />
                <Route path="/article/:id" element={<ArticlePublicPage />} />
                <Route path="/verify-article/:id" element={<VerifyArticlePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
              <Footer 
                links={footerLinks} 
                socialLinks={socialLinks}
                contactInfo={contactInfo}
                siteInfo={siteInfo}
              />
              <FloatingWhatsAppButton />
            </MaintenanceGuard>
          }
        />
      </Routes>
      </Suspense>
      </div>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}

export default App;

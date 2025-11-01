import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { ScrollToTop, ProtectedRoute } from '../components/common';
import { PublicRoute } from '../components/PublicRoute';
import { MaintenanceGuard } from '../components/MaintenanceGuard';
import { FloatingWhatsAppButton } from '../components/FloatingWhatsAppButton';
import { LandingPage, AboutPage, EditorialBoardPage, TeamPage, IssuesArchivePage, PrivacyPolicyPage, TermsAndConditionsPage, ContactPage, IssueDetailsPage, ResearchDetailsPage, VerifyArticlePage, ArticlePublicPage, LoginPage, RegistrationPage, ForgotPasswordPage, VerifyCodePage, ResetPasswordPage, DashboardPage, MaintenancePage } from '../pages';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { AuthProvider, SiteSettingsProvider } from '../contexts';
import {
  navLinks,
  footerLinks,
  socialLinks,
  contactInfo,
  siteInfo,
} from '../data/demoData';

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
                <Route path="/editorial" element={<EditorialBoardPage />} />
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
      </div>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}

export default App;

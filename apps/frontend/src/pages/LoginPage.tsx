import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/sections/LoginForm';
import { loginPageData } from '../data/loginData';
import { useAuth } from '../contexts';
import activityLogsService, { ActivityAction } from '../services/activity-logs.service';
import { User, Shield, FileEdit, Search, Home, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Log activity
        try {
          await activityLogsService.logUserAction(
            ActivityAction.USER_LOGIN,
            `تسجيل دخول المستخدم`,
            { email, remember_me: rememberMe }
          );
        } catch (logError) {
          console.error('Failed to log activity:', logError);
        }
        
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate('/dashboard');
      } else {
        const errorMessage = result.error || 'فشل تسجيل الدخول';
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-center',
        });
      }
    } catch (err) {
      const errorMessage = 'حدث خطأ غير متوقع';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, 'Demo@123');
      
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate('/dashboard');
      } else {
        const errorMessage = result.error || 'فشل تسجيل الدخول';
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-center',
        });
      }
    } catch (err) {
      const errorMessage = 'حدث خطأ غير متوقع';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      {/* Back to Home Button - Fixed Top Left */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 group flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-6 sm:py-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
        title="العودة للصفحة الرئيسية"
      >
        <Home className="w-5 h-5 sm:w-5 sm:h-5 text-[#093059] group-hover:text-[#b2823e] transition-colors" />
        <span className="hidden sm:inline-flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-[#093059] group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-[#093059] group-hover:text-[#b2823e] transition-colors">
            الصفحة الرئيسية
          </span>
        </span>
      </Link>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-2xl w-full">
          {/* Logo and Branding - Outside Container */}
          <div className="flex flex-col items-center mb-10">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/journal-logo.png"
              alt={loginPageData.logo.alt}
              className="h-24 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#093059]">
              {loginPageData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {loginPageData.subtitle}
            </p>
          </div>
        </div>

        {/* White Container - Form Only */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#093059] mb-2">
              {loginPageData.formTitle}
            </h2>
            <p className="text-gray-600">{loginPageData.formDescription}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Demo Accounts */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-bold text-blue-900 mb-3 text-center">حسابات تجريبية - اضغط للدخول مباشرة</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('admin@demo.com')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-800">مدير</div>
                  <div className="text-xs text-gray-600">admin@demo.com</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('editor@demo.com')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileEdit className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-800">محرر</div>
                  <div className="text-xs text-gray-600">editor@demo.com</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('reviewer@demo.com')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-800">محكم</div>
                  <div className="text-xs text-gray-600">reviewer@demo.com</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('researcher@demo.com')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="w-4 h-4 text-orange-600" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-800">باحث</div>
                  <div className="text-xs text-gray-600">researcher@demo.com</div>
                </div>
              </button>
            </div>
            <p className="text-xs text-blue-700 mt-2 text-center">
              {isLoading ? 'جاري تسجيل الدخول...' : 'كلمة المرور: Demo@123'}
            </p>
          </div>

          {/* Login Form Component */}
          <LoginForm
            emailLabel={loginPageData.emailLabel}
            emailPlaceholder={loginPageData.emailPlaceholder}
            passwordLabel={loginPageData.passwordLabel}
            passwordPlaceholder={loginPageData.passwordPlaceholder}
            forgotPasswordText={loginPageData.forgotPasswordText}
            rememberMeText={loginPageData.rememberMeText}
            submitButtonText={isLoading ? 'جاري تسجيل الدخول...' : loginPageData.submitButtonText}
            orDividerText={loginPageData.orDividerText}
            noAccountText={loginPageData.noAccountText}
            createAccountText={loginPageData.createAccountText}
            isLoading={isLoading}
            onSubmit={handleLogin}
          />
        </div>

          {/* Footer Link - Outside Container */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <span>{loginPageData.loginIssueText} </span>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {loginPageData.contactUsText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

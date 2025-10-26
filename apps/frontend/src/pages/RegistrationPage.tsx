import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegistrationForm, RegistrationFormData } from '../components/sections/RegistrationForm';
import { registrationPageData } from '../data/registrationData';
import { useAuth } from '../contexts';
import activityLogsService, { ActivityAction } from '../services/activity-logs.service';
import { CreateUserDto, UserRole } from '../types/user.types';
import { Home, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegistrationPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async (formData: RegistrationFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Map form data to CreateUserDto
      const userData: CreateUserDto = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: formData.accountType as UserRole,
        affiliation: formData.institution,
        specialization: formData.specialization,
        orcid_id: formData.orcid || undefined,
      };

      const result = await register(userData);

      if (result.success) {
        // Log registration activity
        try {
          await activityLogsService.logUserAction(
            ActivityAction.USER_REGISTER,
            `تسجيل مستخدم جديد: ${userData.name}`,
            { email: userData.email, role: userData.role }
          );
        } catch (logError) {
          console.error('❗ Failed to log registration:', logError);
        }
        
        toast.success('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
        navigate('/dashboard');
      } else {
        const errorMessage = result.error || 'فشل إنشاء الحساب';
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
        <span className="hidden sm:inline text-sm font-medium text-[#093059] group-hover:text-[#b2823e] transition-colors">
          الصفحة الرئيسية
        </span>
        <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4 text-[#093059] group-hover:text-[#b2823e] group-hover:translate-x-1 transition-all" />
      </Link>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        {/* Logo and Branding - Outside Container */}
        <div className="flex flex-col items-center mb-10">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/journal-logo.png"
              alt={registrationPageData.logo.alt}
              className="h-24 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#093059]">
              {registrationPageData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {registrationPageData.subtitle}
            </p>
          </div>
        </div>

        {/* White Container - Form Only */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#093059] mb-2">
              {registrationPageData.formTitle}
            </h2>
            <p className="text-gray-600">{registrationPageData.formDescription}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Registration Form Component */}
          <RegistrationForm onSubmit={handleRegistration} isLoading={isLoading} />
        </div>
      </div>
      </div>
    </div>
  );
}

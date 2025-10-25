import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationForm, RegistrationFormData } from '../components/sections/RegistrationForm';
import { registrationPageData } from '../data/registrationData';
import { useAuth } from '../contexts';
import activityLogsService, { ActivityAction } from '../services/activity-logs.service';
import { CreateUserDto, UserRole } from '../types/user.types';

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
        
        navigate('/dashboard');
      } else {
        setError(result.error || 'فشل إنشاء الحساب');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
  );
}

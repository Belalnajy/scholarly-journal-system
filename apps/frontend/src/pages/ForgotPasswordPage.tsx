import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Lightbulb } from 'lucide-react';
import { forgotPasswordData } from '../data/forgotPasswordData';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message);
      // Navigate to verification code page
      navigate('/verify-code', { state: { email } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Branding - Outside Container */}
        <div className="flex flex-col items-center mb-10">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/journal-logo.png"
              alt="شعار المجلة"
              className="h-24 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#093059]">
              مجلة البحوث والدراسات
            </h1>
            <p className="text-lg text-gray-600">
              مرحباً بك في نظام إدارة الأبحاث
            </p>
          </div>
        </div>

        {/* White Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#093059] rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#093059] mb-2">
              {forgotPasswordData.step1.title}
            </h2>
            <p className="text-gray-600">{forgotPasswordData.step1.description}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {forgotPasswordData.step1.emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={forgotPasswordData.step1.emailPlaceholder}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  dir="rtl"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#093059] text-right flex-1">
                <p>{forgotPasswordData.step1.infoMessage}</p>
                <p className="font-medium mt-1">{forgotPasswordData.step1.infoAction}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <span>{forgotPasswordData.step1.submitButton}</span>
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[#b2823e] hover:text-[#93682f] font-medium transition-colors"
            >
              {forgotPasswordData.step1.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

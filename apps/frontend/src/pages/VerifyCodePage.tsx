import { useState, useRef, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { forgotPasswordData } from '../data/forgotPasswordData';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

export function VerifyCodePage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('').slice(0, 6);
      setCode(newCode);
      // Focus on last input
      inputRefs.current[5]?.focus();
      toast.success('تم لصق الرمز بنجاح!');
    } else if (pastedData.length > 0) {
      toast.error('الرمز يجب أن يكون 6 أرقام');
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyResetCode(email, verificationCode);
      toast.success('رمز التحقق صحيح');
      // Navigate to reset password page
      navigate('/reset-password', { state: { email, code: verificationCode } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const response = await authService.resendResetCode(email);
      toast.success(response.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في إعادة إرسال الرمز');
    } finally {
      setResending(false);
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
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#093059] mb-2">
              {forgotPasswordData.step2.title}
            </h2>
            <p className="text-gray-600">{forgotPasswordData.step2.description}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>جاري التحقق...</span>
              ) : (
                <>
                  <span>{forgotPasswordData.step2.submitButton}</span>
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">{forgotPasswordData.step2.didNotReceive}</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#093059] hover:text-[#0a4070] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'جاري الإرسال...' : forgotPasswordData.step2.resendCode}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[#b2823e] hover:text-[#93682f] font-medium transition-colors"
            >
              {forgotPasswordData.step2.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

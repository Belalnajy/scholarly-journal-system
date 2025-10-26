import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPasswordText: string;
  rememberMeText: string;
  submitButtonText: string;
  orDividerText: string;
  noAccountText: string;
  createAccountText: string;
  isLoading?: boolean;
  onSubmit?: (email: string, password: string, rememberMe: boolean) => void | Promise<void>;
}

export function LoginForm({
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  passwordPlaceholder,
  forgotPasswordText,
  rememberMeText,
  submitButtonText,
  orDividerText,
  noAccountText,
  createAccountText,
  isLoading = false,
  onSubmit,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSubmit) {
      await onSubmit(email, password, rememberMe);
    }
  };

  return (
    <div >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2 text-right"
          >
            {emailLabel}
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
              dir="rtl"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2 text-right"
          >
            {passwordLabel}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordPlaceholder}
              className="w-full px-4 py-3 pr-12 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
              dir="rtl"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {forgotPasswordText}
          </Link>
          <div className="flex items-center gap-2">
            <label
              htmlFor="remember"
              className="text-sm text-gray-600 cursor-pointer select-none"
            >
              {rememberMeText}
            </label>
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{submitButtonText}</span>
          <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{orDividerText}</span>
          </div>
        </div>

        {/* Create Account Button */}
        <Link
          to="/register"
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{createAccountText}</span>
        </Link>
      </form>
    </div>
  );
}

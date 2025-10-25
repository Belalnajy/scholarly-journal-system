import { useState } from 'react';
import { Eye, EyeOff, Mail, User, Building2, Phone, ChevronDown, UserPlus } from 'lucide-react';
import { registrationPageData } from '../../data/registrationData';

interface RegistrationFormProps {
  onSubmit?: (formData: RegistrationFormData) => void;
  isLoading?: boolean;
}

export interface RegistrationFormData {
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  orcid: string;
  institution: string;
  country: string;
  city: string;
  specialization: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export function RegistrationForm({ onSubmit, isLoading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    accountType: 'researcher', // Default to researcher
    firstName: '',
    lastName: '',
    email: '',
    orcid: '',
    institution: '',
    country: '',
    city: '',
    specialization: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.lastNameLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder={registrationPageData.lastNamePlaceholder}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.firstNameLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder={registrationPageData.firstNamePlaceholder}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {registrationPageData.emailLabel}
        </label>
        <div className="relative">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={registrationPageData.emailPlaceholder}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            dir="rtl"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-[#093059] font-medium mt-2 text-right">{registrationPageData.emailHint}</p>
      </div>

      {/* ORCID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {registrationPageData.orcidLabel}
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.orcid}
            onChange={(e) => handleChange('orcid', e.target.value)}
            placeholder={registrationPageData.orcidPlaceholder}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            dir="rtl"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-[#093059] font-medium mt-2 text-right">{registrationPageData.orcidHint}</p>
      </div>

      {/* Institution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {registrationPageData.institutionLabel}
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            placeholder={registrationPageData.institutionPlaceholder}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            dir="rtl"
          />
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Country and City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.cityLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder={registrationPageData.cityPlaceholder}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.countryLabel}
          </label>
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            >
              <option value="">{registrationPageData.countryPlaceholder}</option>
              {registrationPageData.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Specialization and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.phoneLabel}
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={registrationPageData.phonePlaceholder}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.specializationLabel}
          </label>
          <div className="relative">
            <select
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            >
              <option value="">{registrationPageData.specializationPlaceholder}</option>
              {registrationPageData.specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Password and Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.confirmPasswordLabel}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder={registrationPageData.confirmPasswordPlaceholder}
              className="w-full px-4 py-3 pr-12 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {registrationPageData.passwordLabel}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={registrationPageData.passwordPlaceholder}
              className="w-full px-4 py-3 pr-12 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-right">{registrationPageData.passwordHint}</p>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 justify-end">
        <div className="text-sm text-gray-600 text-right">
          <span>{registrationPageData.termsText} </span>
          <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            {registrationPageData.termsLink}
          </a>
          <span> {registrationPageData.termsMiddleText} </span>
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            {registrationPageData.privacyLink}
          </a>
          <span> {registrationPageData.termsEndText}</span>
        </div>
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => handleChange('acceptTerms', e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span>{isLoading ? 'جاري إنشاء الحساب...' : registrationPageData.submitButtonText}</span>
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">{registrationPageData.orDividerText}</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-600">
        <span>{registrationPageData.haveAccountText} </span>
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
          {registrationPageData.loginText}
        </a>
      </div>
    </form>
  );
}

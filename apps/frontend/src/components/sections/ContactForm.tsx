import { useState, useEffect } from 'react';
import { Send, Mail, User, MessageSquare } from 'lucide-react';
import contactSubmissionsService from '../../services/contact-submissions.service';
import { useAuth } from '../../contexts';
import toast from 'react-hot-toast';

interface ContactFormProps {
  formData: {
    title: string;
    fields: {
      name: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      inquiryType: { label: string; placeholder: string; options: string[] };
      message: { label: string; placeholder: string };
    };
    submitButton: string;
  };
}

export function ContactForm({ formData }: ContactFormProps) {
  const { user } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    inquiryType: '',
    customSubject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomSubject, setShowCustomSubject] = useState(false);

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formState.name.length < 2) {
      toast.error('الاسم يجب أن يكون حرفين على الأقل');
      return;
    }

    // Validate custom subject if "أخرى" is selected
    if (formState.inquiryType === 'أخرى' && formState.customSubject.length < 2) {
      toast.error('يرجى كتابة الموضوع (حرفين على الأقل)');
      return;
    }

    if (formState.message.length < 10) {
      toast.error('الرسالة يجب أن تكون 10 أحرف على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend
      // Use custom subject if "أخرى" is selected, otherwise use inquiryType
      const finalSubject = formState.inquiryType === 'أخرى' 
        ? formState.customSubject 
        : formState.inquiryType;

      await contactSubmissionsService.create({
        name: formState.name,
        email: formState.email,
        subject: finalSubject,
        message: formState.message,
      });

      // Trigger event to update notifications for admins
      window.dispatchEvent(new Event('notificationsUpdated'));

      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      
      // Reset form
      setFormState({
        name: '',
        email: '',
        inquiryType: '',
        customSubject: '',
        message: '',
      });
      setShowCustomSubject(false);
    } catch (error: any) {
      // Show specific error message if available
      const errorMessage = error.response?.data?.message || 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.';
      toast.error(errorMessage);
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormState({
      ...formState,
      [name]: value,
    });

    // Show custom subject field if "أخرى" is selected
    if (name === 'inquiryType') {
      setShowCustomSubject(value === 'أخرى');
      if (value !== 'أخرى') {
        setFormState(prev => ({ ...prev, customSubject: '' }));
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
            {formData.title}
          </h2>
          <MessageSquare className="size-8 text-[#093059] sm:size-10" />
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        {/* User Info Message */}
        {user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" dir="rtl">
            <p className="text-sm text-blue-800 text-right">
              تم ملء بياناتك تلقائياً. يمكنك تعديلها إذا أردت.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center justify-start gap-2 text-right text-base font-medium text-[#093059] sm:text-lg">
              <span className="text-red-500">*</span>
              {formData.fields.name.label}
              <User className="size-5 text-[#093059]" />
            </label>
            <input
              type="text"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              placeholder={formData.fields.name.placeholder}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#f5f7fa] px-4 py-3 text-right text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2" >
            <label className="flex items-center justify-start gap-2 text-right text-base font-medium text-[#093059] sm:text-lg">
              <span className="text-red-500">*</span>
              {formData.fields.email.label}
              <Mail className="size-5 text-[#093059]" />
            </label>
            <input
              type="email"
              name="email"
              required
              value={formState.email}
              onChange={handleChange}
              placeholder={formData.fields.email.placeholder}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#f5f7fa] px-4 py-3 text-right text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
            />
          </div>

          {/* Inquiry Type Field */}
          <div className="space-y-2">
            <label className="flex items-center justify-start gap-2 text-right text-base font-medium text-[#093059] sm:text-lg">
              <span className="text-red-500">*</span>
              {formData.fields.inquiryType.label}
            </label>
            <select
              name="inquiryType"
              required
              value={formState.inquiryType}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#f5f7fa] px-4 py-3 text-right text-[#093059] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
            >
              <option value="" disabled>
                {formData.fields.inquiryType.placeholder}
              </option>
              {formData.fields.inquiryType.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Subject Field - Shows only when "أخرى" is selected */}
          {showCustomSubject && (
            <div className="space-y-2">
              <label className="flex items-center justify-start gap-2 text-right text-base font-medium text-[#093059] sm:text-lg">
                <span className="text-red-500">*</span>
                اكتب الموضوع
              </label>
              <input
                type="text"
                name="customSubject"
                required
                value={formState.customSubject}
                onChange={handleChange}
                placeholder="مثال: استفسار عن النشر"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#f5f7fa] px-4 py-3 text-right text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
              />
            </div>
          )}

          {/* Message Field */}
          <div className="space-y-2">
            <label className="flex items-center justify-start gap-2 text-right text-base font-medium text-[#093059] sm:text-lg">
              <span className="text-red-500">*</span>
              {formData.fields.message.label}
            </label>
            <textarea
              name="message"
              required
              value={formState.message}
              onChange={handleChange}
              placeholder={formData.fields.message.placeholder}
              rows={6}
              className="w-full resize-none rounded-xl border border-[#e5e5e5] bg-[#f5f7fa] px-4 py-3 text-right text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#093059] px-6 py-4 font-bold text-white transition-all duration-300 hover:bg-[#0a4a7a] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-5" />
            <span>{isSubmitting ? 'جاري الإرسال...' : formData.submitButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

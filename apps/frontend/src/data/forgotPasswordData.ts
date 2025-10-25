export const forgotPasswordData = {
  // Step 1: Email Entry
  step1: {
    icon: 'mail',
    title: 'استعادة كلمة المرور',
    description: 'أدخل بريدك الإلكتروني لاستلام رمز التحقق',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'example@university.com',
    infoMessage: 'سيتم إرسال رمز التحقق إلى بريدك الإلكتروني المسجل في النظام.',
    infoAction: 'إرسال رمز التحقق',
    submitButton: 'استعادة كلمة المرور',
    backToLogin: 'العودة إلى تسجيل الدخول',
  },
  
  // Step 2: Verification Code
  step2: {
    icon: 'shield',
    title: 'رمز التحقق',
    description: 'أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني',
    submitButton: 'تأكيد الرمز',
    didNotReceive: 'لم يصلك الرمز؟',
    resendCode: 'إعادة إرسال الرمز',
    backToLogin: 'العودة إلى تسجيل الدخول',
  },
  
  // Step 3: Reset Password
  step3: {
    icon: 'lock',
    title: 'إعادة تعيين كلمة المرور',
    description: 'أدخل كلمة المرور الجديدة الخاصة بك',
    newPasswordLabel: 'كلمة المرور الجديدة',
    newPasswordPlaceholder: 'أدخل كلمة مرور جديدة',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
    passwordHint: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
    submitButton: 'حفظ كلمة المرور الجديدة',
  },
};

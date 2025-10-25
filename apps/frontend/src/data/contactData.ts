export const contactData = {
  title: 'تواصل معنا',
  subtitle: 'نسعد بتواصلكم معنا للاستفسارات والاقتراحات أو للمساعدة في أي موضوع متعلق بالمجلة',
  
  contactInfo: {
    email: {
      title: 'البريد الإلكتروني',
      items: [
        { label: 'الرئيس التحرير', value: 'editor@research-journal.com' },
        { label: 'الدعم التقني', value: 'support@research-journal.com' },
        { label: 'العام', value: 'info@research-journal.com' },
      ],
    },
    phone: {
      title: 'الهاتف',
      items: [
        { label: 'الأحد - الخميس: 8:00 ص - 4:00 م', value: '+966 11 123 4567' },
        { label: 'فاكس', value: '+966 11 4321 765' },
      ],
    },
    address: {
      title: 'العنوان',
      items: [
        'مؤسسة البحوث والدراسات العلمية',
        'ص.ب 12345، الرياض 11653',
        'المملكة العربية السعودية',
      ],
    },
  },
  
  workingHours: {
    title: 'ساعات العمل',
    schedule: [
      { days: 'الأحد - الخميس', hours: '8:00 ص - 4:00 م' },
      { days: 'الجمعة - السبت', hours: 'مغلق' },
    ],
  },
  
  location: {
    title: 'موقعنا',
    mapTitle: 'خريطة الموقع',
    address: 'الرياض، المملكة العربية السعودية',
  },
  
  form: {
    title: 'إرسال رسالة',
    fields: {
      name: {
        label: 'الاسم الكامل',
        placeholder: 'أدخل الاسم كامل',
      },
      email: {
        label: 'البريد الإلكتروني',
        placeholder: 'example@university.com',
      },
      inquiryType: {
        label: 'نوع الاستفسار',
        placeholder: 'اختر نوع الاستفسار',
        options: [
          'استفسار عام',
          'تقديم بحث',
          'الاشتراك في المجلة',
          'دعم تقني',
          'أخرى',
        ],
      },
      message: {
        label: 'الرسالة',
        placeholder: 'اكتب رسالتك هنا...',
      },
    },
    submitButton: 'إرسال الرسالة',
  },
};

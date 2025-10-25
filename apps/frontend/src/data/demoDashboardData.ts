import { UserRole } from '../types';

// Demo Research Data
export const demoResearch = [
  {
    id: '1',
    title: 'تطبيقات الذكاء الاصطناعي في التعليم العالي',
    author: 'د. أحمد محمد السعيد',
    submittedDate: '2024-10-15',
    status: 'under-review' as const,
    views: 245,
    downloads: 87,
    category: 'تكنولوجيا التعليم',
  },
  {
    id: '2',
    title: 'أثر التعلم الإلكتروني على التحصيل الدراسي',
    author: 'د. فاطمة علي الزهراني',
    submittedDate: '2024-10-12',
    status: 'pending' as const,
    views: 189,
    downloads: 54,
    category: 'العلوم التربوية',
  },
  {
    id: '3',
    title: 'استراتيجيات التدريس الحديثة في القرن الواحد والعشرين',
    author: 'د. خالد حسن القحطاني',
    submittedDate: '2024-10-08',
    status: 'accepted' as const,
    views: 412,
    downloads: 156,
    category: 'المناهج وطرق التدريس',
  },
  {
    id: '4',
    title: 'دور القيادة التربوية في تطوير المؤسسات التعليمية',
    author: 'د. سارة عبدالرحمن الغامدي',
    submittedDate: '2024-09-28',
    status: 'published' as const,
    views: 678,
    downloads: 234,
    category: 'الإدارة التربوية',
  },
];

// Demo Tasks Data
export const demoTasks = [
  {
    id: '1',
    title: 'مراجعة بحث: تطبيقات الذكاء الاصطناعي',
    description: 'مراجعة شاملة للبحث المقدم من د. أحمد محمد حول تطبيقات الذكاء الاصطناعي في التعليم',
    dueDate: '2024-10-25',
    priority: 'high' as const,
    status: 'pending' as const,
    assignedBy: 'د. محمد العتيبي - رئيس التحرير',
  },
  {
    id: '2',
    title: 'تحكيم بحث: التعلم الإلكتروني',
    description: 'تقييم منهجية البحث وجودة المحتوى العلمي',
    dueDate: '2024-10-30',
    priority: 'medium' as const,
    status: 'in-progress' as const,
    assignedBy: 'د. فاطمة الزهراني - المحرر',
  },
  {
    id: '3',
    title: 'مراجعة لغوية: استراتيجيات التدريس',
    description: 'مراجعة اللغة والأسلوب العلمي للبحث',
    dueDate: '2024-11-05',
    priority: 'low' as const,
    status: 'pending' as const,
    assignedBy: 'د. خالد القحطاني - المحرر اللغوي',
  },
];

// Demo Users Data
export const demoUsersData = [
  {
    id: '1',
    name: 'د. أحمد محمد السعيد',
    email: 'ahmed.said@university.edu',
    role: UserRole.RESEARCHER,
    phone: '+966 50 123 4567',
    location: 'الرياض، السعودية',
    joinDate: '2023-01-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'د. فاطمة علي الزهراني',
    email: 'fatima.zahrani@university.edu',
    role: UserRole.EDITOR,
    phone: '+966 55 234 5678',
    location: 'جدة، السعودية',
    joinDate: '2022-08-20',
    isActive: true,
  },
  {
    id: '3',
    name: 'د. خالد حسن القحطاني',
    email: 'khaled.qahtani@university.edu',
    role: UserRole.REVIEWER,
    phone: '+966 54 345 6789',
    location: 'الدمام، السعودية',
    joinDate: '2023-03-10',
    isActive: true,
  },
  {
    id: '4',
    name: 'د. سارة عبدالرحمن الغامدي',
    email: 'sara.ghamdi@university.edu',
    role: UserRole.ADMIN,
    phone: '+966 56 456 7890',
    location: 'مكة، السعودية',
    joinDate: '2021-11-05',
    isActive: true,
  },
  {
    id: '5',
    name: 'د. محمد عبدالله العتيبي',
    email: 'mohammed.otaibi@university.edu',
    role: UserRole.RESEARCHER,
    phone: '+966 53 567 8901',
    location: 'المدينة المنورة، السعودية',
    joinDate: '2023-06-18',
    isActive: false,
  },
];

// Demo Notifications Data
export const demoNotifications = [
  {
    id: '1',
    title: 'تم قبول بحثك',
    message: 'تم قبول بحثك "استراتيجيات التدريس الحديثة" للنشر في العدد القادم',
    type: 'success' as const,
    timestamp: 'منذ ساعتين',
    isRead: false,
  },
  {
    id: '2',
    title: 'مهمة جديدة',
    message: 'تم تعيين مهمة مراجعة بحث جديد لك. الموعد النهائي: 25 أكتوبر',
    type: 'info' as const,
    timestamp: 'منذ 5 ساعات',
    isRead: false,
  },
  {
    id: '3',
    title: 'تذكير: موعد التسليم',
    message: 'تذكير: موعد تسليم مراجعة البحث بعد 3 أيام',
    type: 'warning' as const,
    timestamp: 'منذ يوم واحد',
    isRead: true,
  },
  {
    id: '4',
    title: 'تحديث النظام',
    message: 'سيتم إجراء صيانة للنظام يوم الجمعة من الساعة 12 ص إلى 4 ص',
    type: 'info' as const,
    timestamp: 'منذ يومين',
    isRead: true,
  },
  {
    id: '5',
    title: 'ملاحظات على البحث',
    message: 'تم إضافة ملاحظات جديدة على بحثك من قبل المحكم',
    type: 'warning' as const,
    timestamp: 'منذ 3 أيام',
    isRead: true,
  },
];

// Demo Stats Data
export const demoStats = {
  researcher: [
    {
      title: 'إجمالي الأبحاث',
      value: '12',
      icon: 'FileText',
      trend: { value: '+2', isPositive: true },
      color: '#0D3B66',
    },
    {
      title: 'قيد المراجعة',
      value: '3',
      icon: 'Clock',
      color: '#F4D35E',
    },
    {
      title: 'المقبولة',
      value: '7',
      icon: 'CheckCircle',
      trend: { value: '+1', isPositive: true },
      color: '#95B8D1',
    },
    {
      title: 'المنشورة',
      value: '5',
      icon: 'BookOpen',
      color: '#EE964B',
    },
  ],
  editor: [
    {
      title: 'أبحاث للمراجعة',
      value: '23',
      icon: 'FileText',
      trend: { value: '+5', isPositive: true },
      color: '#0D3B66',
    },
    {
      title: 'المراجعين النشطين',
      value: '15',
      icon: 'Users',
      color: '#F4D35E',
    },
    {
      title: 'الأعداد المنشورة',
      value: '8',
      icon: 'BookOpen',
      trend: { value: '+1', isPositive: true },
      color: '#95B8D1',
    },
    {
      title: 'المقالات الجديدة',
      value: '34',
      icon: 'FileEdit',
      color: '#EE964B',
    },
  ],
  reviewer: [
    {
      title: 'المهام المعلقة',
      value: '5',
      icon: 'ClipboardList',
      color: '#0D3B66',
    },
    {
      title: 'قيد المراجعة',
      value: '2',
      icon: 'Clock',
      color: '#F4D35E',
    },
    {
      title: 'المكتملة',
      value: '18',
      icon: 'CheckCircle',
      trend: { value: '+3', isPositive: true },
      color: '#95B8D1',
    },
    {
      title: 'متوسط الوقت',
      value: '5 أيام',
      icon: 'Timer',
      color: '#EE964B',
    },
  ],
  admin: [
    {
      title: 'إجمالي المستخدمين',
      value: '156',
      icon: 'Users',
      trend: { value: '+12', isPositive: true },
      color: '#0D3B66',
    },
    {
      title: 'الأبحاث النشطة',
      value: '89',
      icon: 'FileText',
      color: '#F4D35E',
    },
    {
      title: 'الأعداد المنشورة',
      value: '24',
      icon: 'BookOpen',
      trend: { value: '+2', isPositive: true },
      color: '#95B8D1',
    },
    {
      title: 'معدل القبول',
      value: '68%',
      icon: 'TrendingUp',
      color: '#EE964B',
    },
  ],
};

// Demo Reviewer Tasks Data
export const demoReviewerTasks = [
  {
    id: '1',
    title: 'تأثير التكنولوجيا الحديثة على التعليم العالي في العالم العربي',
    author: 'د. أحمد محمد',
    submissionDate: '2024-01-15',
    status: 'pending' as const,
    specialization: 'تكنولوجيا التعليم',
    deadline: '2024-02-15',
  },
  {
    id: '2',
    title: 'الذكاء الاصطناعي وتطبيقاته في الطب الحديث',
    author: 'د. محمد علي',
    submissionDate: '2024-01-10',
    status: 'in-progress' as const,
    specialization: 'الطب',
    deadline: '2024-02-10',
  },
  {
    id: '3',
    title: 'التنمية المستدامة في المدن الذكية',
    author: 'د. فاطمة حسن',
    submissionDate: '2024-01-10',
    status: 'completed' as const,
    specialization: 'التخطيط العمراني',
    deadline: '2024-02-05',
  },
];

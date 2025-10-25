import { UserRole, SidebarNavItem } from '../types';

// Navigation items for Researcher role
export const researcherNavItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'submit-research',
    label: 'تقديم بحث جديد',
    icon: 'PlusCircle',
    path: '/dashboard/submit-research',
  },
  {
    id: 'my-research',
    label: 'أبحاثي',
    icon: 'FileText',
    path: '/dashboard/my-research',
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: 'User',
    path: '/dashboard/profile',
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: 'Bell',
    path: '/dashboard/notifications',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'Settings',
    path: '/dashboard/settings',
  },
];

// Navigation items for Editor role
export const editorNavItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'manage-research',
    label: 'إدارة الأبحاث',
    icon: 'FileText',
    path: '/dashboard/manage-research',
  },
  {
    id: 'assign-reviewer',
    label: 'تعيين محكم',
    icon: 'UserPlus',
    path: '/dashboard/assign-reviewer',
  },
  {
    id: 'manage-reviewers',
    label: 'إدارة المراجعين',
    icon: 'Users',
    path: '/dashboard/manage-reviewers',
  },
  {
    id: 'manage-issues',
    label: 'إدارة الأعداد',
    icon: 'BookOpen',
    path: '/dashboard/manage-issues',
  },
  {
    id: 'manage-reports',
    label: 'إدارة التقارير',
    icon: 'BarChart',
    path: '/dashboard/manage-reports',
  },
  {
    id: 'manage-articles',
    label: 'إدارة المقالات',
    icon: 'FileEdit',
    path: '/dashboard/manage-articles',
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: 'User',
    path: '/dashboard/profile',
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: 'Bell',
    path: '/dashboard/notifications',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'Settings',
    path: '/dashboard/settings',
  },
];

// Navigation items for Reviewer role
export const reviewerNavItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'my-tasks',
    label: 'مهامي',
    icon: 'ClipboardList',
    path: '/dashboard/my-tasks',
  },
  {
    id: 'completed-research',
    label: 'الأبحاث المكتملة',
    icon: 'CheckCircle',
    path: '/dashboard/completed-research',
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: 'User',
    path: '/dashboard/profile',
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: 'Bell',
    path: '/dashboard/notifications',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'Settings',
    path: '/dashboard/settings',
  },
];

// Navigation items for Admin role
export const adminNavItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'manage-users',
    label: 'إدارة المستخدمين',
    icon: 'Users',
    path: '/dashboard/manage-users',
  },
  {
    id: 'manage-research',
    label: 'إدارة الأبحاث',
    icon: 'FileText',
    path: '/dashboard/manage-research',
  },
  {
    id: 'assign-reviewer',
    label: 'تعيين محكم',
    icon: 'UserPlus',
    path: '/dashboard/assign-reviewer',
  },
  {
    id: 'manage-reviewers',
    label: 'إدارة المراجعين',
    icon: 'UserCheck',
    path: '/dashboard/manage-reviewers',
  },
  {
    id: 'manage-issues',
    label: 'إدارة الأعداد',
    icon: 'BookOpen',
    path: '/dashboard/manage-issues',
  },
  {
    id: 'manage-reports',
    label: 'إدارة التقارير',
    icon: 'BarChart',
    path: '/dashboard/manage-reports',
  },
  {
    id: 'manage-articles',
    label: 'إدارة المقالات',
    icon: 'FileEdit',
    path: '/dashboard/manage-articles',
  },
  {
    id: 'manage-contact-submissions',
    label: 'رسائل التواصل',
    icon: 'MessageSquare',
    path: '/dashboard/manage-contact-submissions',
  },
  {
    id: 'reports-statistics',
    label: 'التقارير والإحصاءات',
    icon: 'TrendingUp',
    path: '/dashboard/reports',
  },
  {
    id: 'site-settings',
    label: 'إعدادات الموقع',
    icon: 'Globe',
    path: '/dashboard/site-settings',
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: 'User',
    path: '/dashboard/profile',
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: 'Bell',
    path: '/dashboard/notifications',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'Settings',
    path: '/dashboard/settings',
  },
];

// Helper function to get navigation items based on user role
export const getNavigationByRole = (role: UserRole): SidebarNavItem[] => {
  switch (role) {
    case UserRole.RESEARCHER:
      return researcherNavItems;
    case UserRole.EDITOR:
      return editorNavItems;
    case UserRole.REVIEWER:
      return reviewerNavItems;
    case UserRole.ADMIN:
      return adminNavItems;
    default:
      return researcherNavItems;
  }
};

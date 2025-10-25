import { UserRole, User } from '../types';

// Demo users for testing different roles
export const demoUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد السعيد',
    email: 'researcher@demo.com',
    role: UserRole.RESEARCHER,
    avatar: undefined,
  },
  {
    id: '2',
    name: 'فاطمة علي الزهراني',
    email: 'editor@demo.com',
    role: UserRole.EDITOR,
    avatar: undefined,
  },
  {
    id: '3',
    name: 'خالد حسن القحطاني',
    email: 'reviewer@demo.com',
    role: UserRole.REVIEWER,
    avatar: undefined,
  },
  {
    id: '4',
    name: 'سارة عبدالرحمن الغامدي',
    email: 'admin@demo.com',
    role: UserRole.ADMIN,
    avatar: undefined,
  },
];

// Demo password for all users (in production, this will be handled by backend)
export const DEMO_PASSWORD = 'demo123';

// Helper function to authenticate user
export const authenticateUser = (email: string, password: string): User | null => {
  if (password !== DEMO_PASSWORD) {
    return null;
  }
  
  const user = demoUsers.find(u => u.email === email);
  return user || null;
};

// Helper function to get user by id
export const getUserById = (id: string): User | null => {
  return demoUsers.find(u => u.id === id) || null;
};

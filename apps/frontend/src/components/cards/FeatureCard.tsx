import { Calendar, BookOpen, Users, FileText, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface FeatureCardProps {
  feature: Feature;
}

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  book: BookOpen,
  users: Users,
  file: FileText,
};

// Map feature titles to routes
const getRouteForFeature = (title: string): string => {
  if (title.includes('تقديم البحث') || title.includes('تقديم بحث')) {
    return '/dashboard/submit-research';
  } else if (title.includes('الأعداد')) {
    return '/issues';
  } else if (
    title.includes('هيئة التحرير') ||
    title.includes('الفريق الأكاديمي')
  ) {
    return '/team';
  } else if (title.includes('قواعد النشر')) {
    return '/terms'; // توجيه لصفحة الشروط والأحكام
  }
  return '#';
};

export function FeatureCard({ feature }: FeatureCardProps) {
  const IconComponent = iconMap[feature.icon] || FileText;
  const navigate = useNavigate();
  const route = getRouteForFeature(feature.title);

  const handleClick = () => {
    if (route === '#') return;

    // Check if route requires authentication
    if (route === '/dashboard/submit-research') {
      const isLoggedIn = authService.isAuthenticated();
      if (isLoggedIn) {
        navigate(route);
      } else {
        navigate('/login', { state: { from: route } });
      }
    } else {
      navigate(route);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex h-auto min-h-[200px] w-full flex-col items-center justify-center gap-6 rounded-2xl bg-white px-4 py-6 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] transition-all hover:shadow-lg sm:min-h-[220px] sm:gap-7 sm:px-5 sm:py-7 lg:h-[250px] lg:w-[304px] lg:gap-8 lg:px-6 lg:py-8 ${
        route !== '#' ? 'cursor-pointer' : ''
      }`}
    >
      {/* Icon */}
      <IconComponent
        className="size-10 text-[#093059] sm:size-12 lg:size-[50px]"
        strokeWidth={1.5}
      />

      {/* Content */}
      <div className="flex flex-col items-center gap-2 text-center px-2">
        <h4
          className="text-lg font-bold text-[#093059] sm:text-xl lg:text-[24px]"
          dir="auto"
        >
          {feature.title}
        </h4>
        <p
          className="text-base font-medium text-[#093059] sm:text-lg lg:text-[20px]"
          dir="auto"
        >
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

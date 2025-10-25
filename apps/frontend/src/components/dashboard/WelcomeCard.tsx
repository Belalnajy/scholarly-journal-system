// Shared Welcome Card Component
// Used across: ResearcherDashboard, ReviewerDashboard

interface WelcomeCardProps {
  userName: string;
  subtitle: string;
  variant?: 'blue' | 'green' | 'purple';
}

export function WelcomeCard({ userName, subtitle, variant = 'blue' }: WelcomeCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
      case 'green':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
      case 'purple':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200';
    }
  };

  return (
    <div className={`${getVariantClasses()} rounded-2xl p-6 border`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        مرحباً بك، {userName}
      </h2>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}

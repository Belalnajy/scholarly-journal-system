import { Calendar, BookOpen, Users, FileText, LucideIcon } from "lucide-react";

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
  file: FileText
};

export function FeatureCard({ feature }: FeatureCardProps) {
  const IconComponent = iconMap[feature.icon] || FileText;

  return (
    <div className="flex h-auto min-h-[200px] w-full flex-col items-center justify-center gap-6 rounded-2xl bg-white px-4 py-6 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 sm:min-h-[220px] sm:gap-7 sm:px-5 sm:py-7 lg:h-[250px] lg:w-[304px] lg:gap-8 lg:px-6 lg:py-8">
      {/* Icon */}
      <IconComponent className="size-10 text-[#093059] sm:size-12 lg:size-[50px]" strokeWidth={1.5} />

      {/* Content */}
      <div className="flex flex-col items-center gap-2 text-center px-2">
        <h4 className="text-lg font-bold text-[#093059] sm:text-xl lg:text-[24px]" dir="auto">
          {feature.title}
        </h4>
        <p className="text-base font-medium text-[#093059] sm:text-lg lg:text-[20px]" dir="auto">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

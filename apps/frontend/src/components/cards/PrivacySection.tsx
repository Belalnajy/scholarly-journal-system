import { Shield, Database, Settings, Lock, Share2, ClipboardList } from 'lucide-react';
import { ListItem } from '../common';

interface PrivacySectionProps {
  title: string;
  icon: string;
  content: string[];
}

const iconMap = {
  shield: Shield,
  database: Database,
  settings: Settings,
  lock: Lock,
  share: Share2,
  clipboard: ClipboardList,
};

export function PrivacySection({ title, icon, content }: PrivacySectionProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Shield;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center justify-end gap-3 bg-[#b3b3b3] px-6 py-4 sm:gap-4 sm:px-8">
        <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
          {title}
        </h2>
        <IconComponent className="size-8 text-[#093059] sm:size-10" />
      </div>
      <div className="p-6 sm:p-8 lg:p-10">
        <ul className="space-y-4 list-inside" dir="rtl">
          {content.map((item, index) => (
            <ListItem key={index}>{item}</ListItem>
          ))}
        </ul>
      </div>
    </div>
  );
}

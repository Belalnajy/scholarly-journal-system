import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  className?: string;
}

export function SectionCard({ title, icon, content, className = '' }: SectionCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.3 }}
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ${className}`}
    >
      <div className="flex items-center justify-end gap-3 bg-[#b3b3b3] px-6 py-4 sm:gap-4 sm:px-8">
        <h3 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="auto">
          {title}
        </h3>
        {icon}
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-right text-base leading-relaxed text-[#093059] sm:text-lg lg:text-xl" dir="auto">
          {content}
        </p>
      </div>
    </motion.div>
  );
}

// Reviewer Card Component
// Used in: AssignReviewerPage

import { User } from 'lucide-react';

interface Reviewer {
  id: string;
  name: string;
  specialization: string;
  completedReviews: number;
  availability: 'available' | 'busy';
}

interface ReviewerCardProps {
  reviewer: Reviewer;
  isSelected: boolean;
  onSelect: () => void;
}

export function ReviewerCard({ 
  reviewer, 
  isSelected, 
  onSelect 
}: ReviewerCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg border-2 transition-all ${
        isSelected 
          ? 'border-[#0D3B66] bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div 
          onClick={onSelect}
          className="cursor-pointer"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected 
              ? 'border-[#0D3B66] bg-[#0D3B66]' 
              : 'border-gray-300 bg-white'
          }`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{reviewer.name}</h3>
          <p className="text-sm text-gray-600">{reviewer.specialization}</p>
          <p className="text-xs text-gray-500 mt-1">
            {reviewer.completedReviews} مراجعة مكتملة • {reviewer.availability === 'available' ? 'متاح' : 'مشغول'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs text-[#0D3B66] border border-[#0D3B66] rounded-lg hover:bg-blue-50 transition-colors">
            التخصص المطابق
          </button>
          <button className="px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            تقييم الأداء
          </button>
          <button className="px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            مقارنة البيانات
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export type for convenience
export type { Reviewer };

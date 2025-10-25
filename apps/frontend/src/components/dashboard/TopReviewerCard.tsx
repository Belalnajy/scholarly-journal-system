// Top Reviewer Card Component
// Used in: EditorDashboard

interface TopReviewer {
  id: string;
  name: string;
  completedReviews: number;
  specialty: string;
}

interface TopReviewerCardProps {
  reviewer: TopReviewer;
}

export function TopReviewerCard({ reviewer }: TopReviewerCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">
            {reviewer.name.split(' ')[1]?.charAt(0) || 'م'}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{reviewer.name}</h3>
          <p className="text-xs text-gray-500">{reviewer.specialty}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-[#0D3B66]">{reviewer.completedReviews}</p>
        <p className="text-xs text-gray-500">مراجعة مكتملة</p>
      </div>
    </div>
  );
}

// Re-export type for convenience
export type { TopReviewer };

import { CheckCircle, Clock, FileText, Edit3, Users, AlertCircle } from 'lucide-react';
import { Research } from '../services/researchService';
import { Review } from '../services/reviews.service';
import { ResearchRevision } from '../services/research-revisions.service';

interface TimelineEvent {
  id: string;
  type: 'submission' | 'review' | 'revision-request' | 'revision-submitted' | 'decision';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'current';
  icon: React.ReactNode;
  color: string;
  details?: string[];
}

interface ResearchTimelineProps {
  research: Research;
  reviews?: Review[];
  revisions?: ResearchRevision[];
}

export function ResearchTimeline({ research, reviews = [], revisions = [] }: ResearchTimelineProps) {
  const events: TimelineEvent[] = [];

  // 1. Initial Submission
  events.push({
    id: 'submission',
    type: 'submission',
    title: 'تقديم البحث',
    description: 'تم تقديم البحث للمراجعة',
    date: research.submission_date,
    status: 'completed',
    icon: <FileText className="w-5 h-5" />,
    color: 'blue',
    details: [
      `العنوان: ${research.title}`,
      `التخصص: ${research.specialization}`,
      `رقم البحث: ${research.research_number}`,
    ],
  });

  // 2. Reviews
  if (reviews.length > 0) {
    const completedReviews = reviews.filter(r => r.status === 'completed');
    const pendingReviews = reviews.filter(r => r.status === 'pending');

    if (completedReviews.length > 0) {
      events.push({
        id: 'reviews-completed',
        type: 'review',
        title: `مراجعات المحكمين (${completedReviews.length})`,
        description: `تم استلام ${completedReviews.length} تقييم من المحكمين`,
        date: completedReviews[0].created_at,
        status: 'completed',
        icon: <Users className="w-5 h-5" />,
        color: 'green',
        details: completedReviews.map(r => 
          `محكم (الهوية محجوبة): ${r.recommendation === 'accepted' ? 'قبول' : r.recommendation === 'rejected' ? 'رفض' : 'يحتاج تعديلات'} (${r.average_rating}/5)`
        ),
      });
    }

    if (pendingReviews.length > 0) {
      events.push({
        id: 'reviews-pending',
        type: 'review',
        title: `في انتظار المراجعات (${pendingReviews.length})`,
        description: `${pendingReviews.length} محكم لم يقدم تقييمه بعد`,
        date: new Date().toISOString(),
        status: 'current',
        icon: <Clock className="w-5 h-5" />,
        color: 'yellow',
      });
    }
  }

  // 3. Revisions
  revisions.forEach((revision, index) => {
    // Revision Request
    events.push({
      id: `revision-request-${revision.id}`,
      type: 'revision-request',
      title: `طلب تعديلات - المراجعة #${revision.revision_number}`,
      description: 'المحرر طلب إجراء تعديلات على البحث',
      date: revision.created_at,
      status: 'completed',
      icon: <Edit3 className="w-5 h-5" />,
      color: 'orange',
      details: [
        `التعديلات المطلوبة: ${revision.revision_notes}`,
        revision.deadline ? `الموعد النهائي: ${new Date(revision.deadline).toLocaleDateString('ar-EG')}` : '',
      ].filter(Boolean),
    });

    // Revision Submitted
    if (revision.status === 'submitted' && revision.submitted_at) {
      events.push({
        id: `revision-submitted-${revision.id}`,
        type: 'revision-submitted',
        title: `إرسال التعديلات - المراجعة #${revision.revision_number}`,
        description: 'الباحث قام بإرسال النسخة المعدلة',
        date: revision.submitted_at,
        status: 'completed',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'green',
        details: [
          'تم رفع ملف جديد',
          'تم تحديث الملخص والكلمات المفتاحية',
        ],
      });
    } else if (revision.status === 'pending') {
      events.push({
        id: `revision-pending-${revision.id}`,
        type: 'revision-submitted',
        title: `في انتظار التعديلات - المراجعة #${revision.revision_number}`,
        description: 'الباحث لم يرسل التعديلات بعد',
        date: new Date().toISOString(),
        status: 'current',
        icon: <Clock className="w-5 h-5" />,
        color: 'yellow',
      });
    }
  });

  // 4. Final Decision
  if (research.status === 'accepted') {
    events.push({
      id: 'decision-accepted',
      type: 'decision',
      title: 'قبول البحث',
      description: 'تم قبول البحث للنشر',
      date: research.evaluation_date || research.updated_at,
      status: 'completed',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green',
    });
  } else if (research.status === 'rejected') {
    events.push({
      id: 'decision-rejected',
      type: 'decision',
      title: 'رفض البحث',
      description: 'تم رفض البحث',
      date: research.evaluation_date || research.updated_at,
      status: 'completed',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'red',
    });
  }

  // Sort events by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getColorClasses = (color: string, status: string) => {
    const baseColors = {
      blue: 'bg-blue-500 border-blue-500',
      green: 'bg-green-500 border-green-500',
      orange: 'bg-orange-500 border-orange-500',
      yellow: 'bg-yellow-500 border-yellow-500',
      red: 'bg-red-500 border-red-500',
    };

    const lightColors = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      red: 'bg-red-50 border-red-200',
    };

    if (status === 'current') {
      return {
        dot: `${baseColors[color as keyof typeof baseColors]} ring-4 ring-${color}-100`,
        card: `${lightColors[color as keyof typeof lightColors]} border-2`,
        text: `text-${color}-700`,
      };
    }

    return {
      dot: status === 'completed' ? baseColors[color as keyof typeof baseColors] : 'bg-gray-300 border-gray-300',
      card: status === 'completed' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200',
      text: status === 'completed' ? 'text-gray-700' : 'text-gray-500',
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden" dir="rtl">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">تاريخ البحث</h2>
        <p className="text-sm text-gray-500 mt-1">
          تتبع جميع المراحل التي مر بها البحث
        </p>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute right-[29px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Events */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const colors = getColorClasses(event.color, event.status);
              
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex-shrink-0 w-[60px] h-[60px] rounded-full ${colors.dot} flex items-center justify-center text-white`}>
                    {event.icon}
                  </div>

                  {/* Event Card */}
                  <div className={`flex-1 rounded-lg border ${colors.card} p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-bold text-lg ${colors.text}`}>
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap mr-4">
                        {new Date(event.date).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Event Details */}
                    {event.details && event.details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <ul className="space-y-1">
                          {event.details.map((detail, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Status Badge */}
                    {event.status === 'current' && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${event.color}-100 text-${event.color}-700`}>
                          <Clock className="w-3 h-3" />
                          جاري التنفيذ
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

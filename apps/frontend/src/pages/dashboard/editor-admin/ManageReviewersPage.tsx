import { Eye, Send, X, Mail, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../../components/dashboard';
import usersService from '../../../services/users.service';
import { UserResponse } from '../../../types/user.types';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import toast, { Toaster } from 'react-hot-toast';

// Types
interface Reviewer {
  id: string;
  name: string;
  specialization: string;
  email: string;
  orcid?: string;
  university: string;
  status: 'active' | 'busy' | 'inactive';
  completedReviews: number;
  activeReviews: number;
  bio: string;
  interests: string[];
}

// Demo data (fallback)
const demoReviewers: Reviewer[] = [
  {
    id: '1',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    orcid: '0000-0002-1234-5678',
    university: 'جامعة الملك سعود',
    status: 'active',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
  {
    id: '2',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    status: 'active',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
  {
    id: '3',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    status: 'busy',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
  {
    id: '4',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    status: 'busy',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
  {
    id: '5',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    status: 'busy',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
  {
    id: '6',
    name: 'د. محمد سالم',
    specialization: 'علوم الحاسوب',
    email: 'm.ahmed@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    status: 'busy',
    completedReviews: 15,
    activeReviews: 3,
    bio: 'باحث متخصص في تطبيقات الذكاء الاصطناعي في التعليم مع خبرة تزيد عن 15 عاماً في مجال تقنيات التعليم',
    interests: ['الذكاء الاصطناعي', 'التعليم الإلكتروني', 'تحليل البيانات التعليمية'],
  },
];

// Reviewer Details Modal
function ReviewerDetailsModal({ 
  reviewer, 
  onClose 
}: { 
  reviewer: Reviewer; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">الملف الأكاديمي للباحث</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" dir="rtl">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl text-blue-600 font-bold">
                {reviewer.name.split(' ')[1]?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{reviewer.name}</h3>
              <p className="text-sm text-gray-600">{reviewer.university}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                reviewer.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {reviewer.status === 'active' ? 'نشط' : 'مشغول'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3">معلومات التواصل</h4>
            <div className="space-y-2">
              <a 
                href={`mailto:${reviewer.email}`}
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{reviewer.email}</span>
              </a>
              {reviewer.orcid && (
                <a 
                  href={`https://orcid.org/${reviewer.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ORCID: {reviewer.orcid}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3">السيرة الذاتية</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{reviewer.bio}</p>
          </div>

          {/* Interests */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3">الاهتمامات البحثية</h4>
            <div className="flex flex-wrap gap-2">
              {reviewer.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              إغلاق
            </button>
            <button className="flex-1 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>زيارة ملف ORCID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reviewer Card Component
function ReviewerCard({ reviewer, onViewDetails }: { reviewer: Reviewer; onViewDetails: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              {reviewer.name.split(' ')[1]?.charAt(0) || 'م'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{reviewer.name}</h3>
            <p className="text-sm text-gray-600">{reviewer.specialization}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          reviewer.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {reviewer.status === 'active' ? 'نشط' : 'مشغول'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{reviewer.completedReviews}</p>
          <p className="text-xs text-gray-600">مراجعة مكتملة</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{reviewer.activeReviews}</p>
          <p className="text-xs text-gray-600">مراجعة نشطة</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={onViewDetails}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>عرض التفاصيل</span>
        </button>
        <button 
          onClick={() => navigate('/dashboard/manage-research')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          <span>تعيين بحث</span>
        </button>
      </div>
    </div>
  );
}

export function ManageReviewersPage() {
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewersPerPage = 6;

  // Fetch reviewers from backend
  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users and filter reviewers with active status
      const allUsers = await usersService.getAll();
      const reviewersOnly = allUsers.filter(
        user => user.role === 'reviewer' && user.status === 'active'
      );
      
      // Map UserResponse to Reviewer interface with real stats
      const mappedReviewers: Reviewer[] = await Promise.all(
        reviewersOnly.map(async (user) => {
          try {
            // Get reviewer stats from assignments
            const stats = await reviewerAssignmentsService.getReviewerStats(user.id);
            
            return {
              id: user.id,
              name: user.name,
              specialization: user.specialization || 'غير محدد',
              email: user.email,
              orcid: undefined, // TODO: إضافة حقل orcid في UserResponse
              university: user.affiliation || 'غير محدد',
              status: 'active', // من Backend
              completedReviews: stats.completed || 0,
              activeReviews: (stats.assigned || 0) + (stats.accepted || 0),
              bio: user.bio || 'لا توجد سيرة ذاتية',
              interests: user.specialization ? [user.specialization] : [],
            };
          } catch (err) {
            // If stats fetch fails, return with 0 values
            return {
              id: user.id,
              name: user.name,
              specialization: user.specialization || 'غير محدد',
              email: user.email,
              orcid: undefined,
              university: user.affiliation || 'غير محدد',
              status: 'active',
              completedReviews: 0,
              activeReviews: 0,
              bio: user.bio || 'لا توجد سيرة ذاتية',
              interests: user.specialization ? [user.specialization] : [],
            };
          }
        })
      );
      
      setReviewers(mappedReviewers.length > 0 ? mappedReviewers : demoReviewers);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل بيانات المراجعين';
      setError(errorMessage);
      toast.error(errorMessage);
      // Use demo data on error
      setReviewers(demoReviewers);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: reviewers.length,
    active: reviewers.filter(r => r.status === 'active').length,
    averageTime: 2, // TODO: حساب من البيانات الحقيقية
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات المراجعين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Container */}
      <Toaster />
      
      {/* Header */}
      <DashboardHeader title="إدارة المراجعين" subtitle="قائمة أداء المحكمين والمراجعين" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">إجمالي المراجعين</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المراجعين النشطين</h3>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.active}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">متوسط وقت المراجعة</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-amber-600 text-xl">⏱</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.averageTime}</p>
        </div>
      </div>

      {/* Reviewers List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">قائمة المراجعين</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewers
            .slice((currentPage - 1) * reviewersPerPage, currentPage * reviewersPerPage)
            .map((reviewer) => (
              <ReviewerCard
                key={reviewer.id}
                reviewer={reviewer}
                onViewDetails={() => setSelectedReviewer(reviewer)}
              />
            ))}
        </div>

        {/* Pagination */}
        {reviewers.length > reviewersPerPage && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(reviewers.length / reviewersPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-[#0D3B66] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(reviewers.length / reviewersPerPage), p + 1))}
              disabled={currentPage === Math.ceil(reviewers.length / reviewersPerPage)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedReviewer && (
        <ReviewerDetailsModal
          reviewer={selectedReviewer}
          onClose={() => setSelectedReviewer(null)}
        />
      )}
    </div>
  );
}

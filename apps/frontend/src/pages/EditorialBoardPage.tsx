import { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import { EditorCard, FeatureCard } from '../components/cards';
import { editorialBoardData } from '../data/demoData';
import { NewsletterSection } from '../components';
import usersService from '../services/users.service';
import { UserResponse } from '../types/user.types';
import toast, { Toaster } from 'react-hot-toast';

export function EditorialBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editors, setEditors] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch editors from backend
  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users and filter editors with active status
      const allUsers = await usersService.getAll();
      const editorsOnly = allUsers.filter(
        user => user.role === 'editor' && user.status === 'active'
      );
      
      setEditors(editorsOnly);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل بيانات هيئة التحرير';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Use real data if available, otherwise fallback to demo data
  const members = editors.length > 0 ? editors : editorialBoardData.members;

  // Get unique specializations from editors
  const getUniqueSpecializations = () => {
    if (editors.length === 0) {
      return editorialBoardData.categories;
    }

    const specializations = editors
      .map(editor => editor.specialization)
      .filter((spec): spec is string => !!spec && spec.trim() !== '');

    const uniqueSpecs = Array.from(new Set(specializations));

    // Create categories from unique specializations
    const categories = [
      { id: 'all', label: 'جميع التخصصات' },
      ...uniqueSpecs.map(spec => ({
        id: spec.toLowerCase().replace(/\s+/g, '-'),
        label: spec
      }))
    ];

    return categories;
  };

  const categories = getUniqueSpecializations();

  const filteredMembers =
    selectedCategory === 'all'
      ? members
      : members.filter((member: any) => {
          const memberSpec = member.specialization || member.category;
          const categoryId = memberSpec?.toLowerCase().replace(/\s+/g, '-');
          return categoryId === selectedCategory;
        });

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[141px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#093059] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات هيئة التحرير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[141px]">
      {/* Toast Container */}
      <Toaster />
      
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[#093059] p-4">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-[#093059] sm:text-5xl lg:text-6xl" dir="rtl">
            {editorialBoardData.title}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl" dir="rtl">
            {editorialBoardData.description}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12" dir="rtl">
          {/* Show All button always visible */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-8 py-3 text-base font-bold transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-[#093059] text-white shadow-lg scale-105'
                  : 'bg-white text-[#093059] hover:bg-gray-100 border-2 border-[#093059]'
              }`}
            >
              جميع التخصصات ({editors.length})
            </button>
          </div>

          {/* Specializations in scrollable container */}
          {categories.length > 1 && (
            <div className="relative">
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-2 px-4 min-w-max justify-center">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category.id
                          ? 'bg-[#b2823e] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Scroll indicators */}
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Active filter indicator */}
          {selectedCategory !== 'all' && (
            <div className="text-center mt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#b2823e]/10 text-[#b2823e] rounded-lg text-sm font-medium">
                <span>التخصص المحدد:</span>
                <span className="font-bold">
                  {categories.find(c => c.id === selectedCategory)?.label}
                </span>
                <span className="text-xs">
                  ({filteredMembers.length} محرر)
                </span>
              </span>
            </div>
          )}
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .hide-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .hide-scrollbar::-webkit-scrollbar-thumb {
            background: #093059;
            border-radius: 10px;
          }
          .hide-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #0a4a7a;
          }
        `}</style>

        {/* Editorial Board Members Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member: any) => (
            <EditorCard
              key={member.id}
              name={member.name}
              title={member.specialization || member.title || 'عضو هيئة التحرير'}
              role={member.role === 'editor' ? 'عضو هيئة التحرير' : member.role}
              university={member.affiliation || member.university || 'غير محدد'}
              country={member.country || 'المملكة العربية السعودية'}
              email={member.email}
              orcid={member.orcid || ''}
              image={member.avatar_url || member.image || '/test-profile/image 14.png'}
            />
          ))}
        </div>

        {/* Join Section */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
            {/* Membership Requirements */}
            <div className="text-right" dir="rtl">
              <h2 className="mb-6 text-2xl font-bold text-[#093059] sm:text-3xl">متطلبات العضوية</h2>
              <ul className="space-y-4">
                {editorialBoardData.membershipRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-[#b2823e]"></div>
                    </div>
                    <span className="text-lg leading-relaxed text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Join Info */}
            <div className="rounded-xl bg-gradient-to-br from-[#093059] to-[#0a4a7a] p-8 text-right text-white" dir="rtl">
              <div className="mb-4 flex justify-end">
                <Mail className="h-10 w-10 text-[#b2823e]" />
              </div>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{editorialBoardData.joinInfo.title}</h2>
              <p className="mb-6 text-lg leading-relaxed opacity-90">{editorialBoardData.joinInfo.description}</p>
              <a
                href={`mailto:${editorialBoardData.joinInfo.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#b2823e] px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-[#9a6f35] hover:shadow-lg"
              >
                <Mail className="h-5 w-5" />
                <span>التواصل معنا</span>
              </a>
              
            </div>
          </div>
        </div>
      </div>
                    <NewsletterSection />
    </div>
  );
}

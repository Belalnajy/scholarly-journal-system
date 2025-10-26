import { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import { EditorCard } from '../components/cards';
import { NewsletterSection } from '../components';
import usersService from '../services/users.service';
import { UserResponse } from '../types/user.types';
import { motion, AnimatePresence } from 'framer-motion';

export function EditorialBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editors, setEditors] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch editors from backend
  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    try {
      setLoading(true);
      
      // Get editors from public endpoint
      const editorsData = await usersService.getEditors();
      setEditors(editorsData);
      
    } catch (err: any) {
      console.error('Error loading editors:', err);
      setEditors([]);
    } finally {
      setLoading(false);
    }
  };

  const members = editors;

  // Get unique specializations from editors
  const getUniqueSpecializations = () => {
    if (editors.length === 0) {
      return [{ id: 'all', label: 'جميع التخصصات' }];
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
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="mb-6 flex justify-center"
          >
            <div className="rounded-full bg-[#093059] p-4">
              <Users className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4 text-4xl font-bold text-[#093059] sm:text-5xl lg:text-6xl" 
            dir="rtl"
          >
            هيئة التحرير
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl" 
            dir="rtl"
          >
            نخبة من الأكاديميين والباحثين المتميزين في مختلف التخصصات
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12" 
          dir="rtl"
        >
          {/* Show All button always visible */}
          <div className="flex justify-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-8 py-3 text-base font-bold transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-[#093059] text-white shadow-lg scale-105'
                  : 'bg-white text-[#093059] hover:bg-gray-100 border-2 border-[#093059]'
              }`}
            >
              جميع التخصصات ({editors.length})
            </motion.button>
          </div>

          {/* Specializations in scrollable container */}
          {categories.length > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative"
            >
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-2 px-4 min-w-max justify-center">
                  {categories.slice(1).map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category.id
                          ? 'bg-[#b2823e] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Scroll indicators */}
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </motion.div>
          )}

          {/* Active filter indicator */}
          <AnimatePresence>
            {selectedCategory !== 'all' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center mt-4"
              >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#b2823e]/10 text-[#b2823e] rounded-lg text-sm font-medium">
                <span>التخصص المحدد:</span>
                <span className="font-bold">
                  {categories.find(c => c.id === selectedCategory)?.label}
                </span>
                <span className="text-xs">
                  ({filteredMembers.length} محرر)
                </span>
              </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member: any, index: number) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EditorCard
              name={member.name}
              title={member.specialization || member.title || 'عضو هيئة التحرير'}
              role={member.role === 'editor' ? 'عضو هيئة التحرير' : member.role}
              university={member.affiliation || member.university || 'غير محدد'}
              country={member.country || 'المملكة العربية السعودية'}
              email={member.email}
              orcid={member.orcid || ''}
              image={member.avatar_url || member.image || '/test-profile/image 14.png'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Join Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl bg-white shadow-lg"
        >
          <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
            {/* Membership Requirements */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-right" 
              dir="rtl"
            >
              <h2 className="mb-6 text-2xl font-bold text-[#093059] sm:text-3xl">متطلبات العضوية</h2>
              <ul className="space-y-4">
                {[
                  'حاصل على درجة الدكتوراه في التخصص',
                  'خبرة لا تقل عن 5 سنوات في البحث العلمي',
                  'نشر أبحاث في مجلات علمية محكمة',
                  'الالتزام بأخلاقيات البحث العلمي'
                ].map((requirement, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-[#b2823e]"></div>
                    </div>
                    <span className="text-lg leading-relaxed text-gray-700">{requirement}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Join Info */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl bg-gradient-to-br from-[#093059] to-[#0a4a7a] p-8 text-right text-white" 
              dir="rtl"
            >
              <div className="mb-4 flex justify-end">
                <Mail className="h-10 w-10 text-[#b2823e]" />
              </div>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">انضم إلى هيئة التحرير</h2>
              <p className="mb-6 text-lg leading-relaxed opacity-90">نرحب بانضمام الباحثين المتميزين إلى هيئة التحرير. للاستفسار عن متطلبات العضوية، يرجى التواصل معنا.</p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:info@journal.com"
                className="inline-flex items-center gap-2 rounded-full bg-[#b2823e] px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-[#9a6f35] hover:shadow-lg"
              >
                <Mail className="h-5 w-5" />
                <span>التواصل معنا</span>
              </motion.a>
              
            </motion.div>
          </div>
        </motion.div>
      </div>
                    <NewsletterSection />
    </div>
  );
}

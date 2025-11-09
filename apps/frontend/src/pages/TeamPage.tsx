import { useState, useEffect } from 'react';
import { Users, UserCog, Briefcase, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsletterSection } from '../components';
import teamService from '../services/teamService';
import { TeamSection, TeamMember } from '../types/team.types';

export function TeamPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [teamSections, setTeamSections] = useState<TeamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team sections from API
  useEffect(() => {
    fetchTeamSections();
  }, []);

  const fetchTeamSections = async () => {
    try {
      setLoading(true);
      const sections = await teamService.getAllSections();
      setTeamSections(sections);
      // Auto-expand first collapsible section if available
      if (sections.length > 0 && !expandedSection) {
        const firstCollapsible = sections.find(s => s.is_collapsible);
        if (firstCollapsible) {
          setExpandedSection(firstCollapsible.id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching team sections:', err);
      setError('فشل في تحميل بيانات الفريق');
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping (since we can't store React components in database)
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Users,
      UserCog,
      Briefcase,
      HeartHandshake,
    };
    return icons[iconName] || Users;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[141px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#093059] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الفريق...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[141px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const toggleSection = (sectionId: string, isCollapsible: boolean) => {
    // Only toggle if section is collapsible
    if (isCollapsible) {
      setExpandedSection(expandedSection === sectionId ? null : sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[141px]">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20" dir="rtl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="mb-6 flex justify-center"
          >
            <div className="rounded-full bg-gradient-to-br from-[#093059] to-[#0a4a7a] p-5">
              <Users className="h-14 w-14 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4 text-4xl font-bold text-[#093059] sm:text-5xl lg:text-6xl"
            dir="rtl"
          >
            الفريق الأكاديمي والإداري
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl"
            dir="rtl"
          >
            نخبة من الأكاديميين والمتخصصين الذين يقودون المجلة نحو التميز العلمي
          </motion.p>
        </motion.div>

        {/* Team Sections */}
        <div className="space-y-8">
          {teamSections.map((section, index) => {
            const Icon = getIconComponent(section.icon);
            // Non-collapsible sections are always expanded
            const isExpanded = !section.is_collapsible || expandedSection === section.id;
            const hasMembers = section.members && section.members.length > 0;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="overflow-hidden rounded-2xl bg-white shadow-lg"
              >
                {/* Section Header */}
                <motion.button
                  onClick={() => toggleSection(section.id, section.is_collapsible)}
                  className={`w-full bg-gradient-to-r ${section.color} p-8 text-right transition-all duration-300 ${
                    section.is_collapsible ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
                  }`}
                  whileHover={section.is_collapsible ? { scale: 1.01 } : {}}
                  whileTap={section.is_collapsible ? { scale: 0.99 } : {}}
                  dir="rtl"
                >
                  <div className="flex flex-row-reverse items-center justify-between">
                    {section.is_collapsible ? (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-white"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.div>
                    ) : (
                      <div className="w-6" /> // Spacer for non-collapsible sections
                    )}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h2 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                          {section.title}
                        </h2>
                        <p className="text-sm text-white/90 sm:text-base">
                          {section.description}
                        </p>
                        {hasMembers && (
                          <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                            {section.members.length}{' '}
                            {section.members.length === 1 ? 'عضو' : 'أعضاء'}
                          </span>
                        )}
                      </div>
                      <div className="rounded-full bg-white/20 p-3">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {hasMembers ? (
                        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
                          {section.members.map((member, memberIndex) => (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: memberIndex * 0.1,
                              }}
                            >
                              <TeamMemberCard
                                member={member}
                                sectionColor={section.color}
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center" dir="rtl">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <Icon className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg text-gray-600">
                            سيتم إضافة أعضاء هذا القسم قريباً
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {[
            {
              number: teamSections.reduce(
                (acc, section) => acc + section.members.length,
                0
              ),
              label: 'إجمالي أعضاء الفريق',
              icon: Users,
              color: 'from-[#093059] to-[#0a4a7a]',
            },
            {
              number: teamSections.filter((s) => s.members.length > 0).length,
              label: 'الأقسام النشطة',
              icon: Briefcase,
              color: 'from-[#b2823e] to-[#9a6f35]',
            },
            {
              number: new Set(
                teamSections.flatMap((s) => s.members.map((m) => m.country))
              ).size,
              label: 'دول ممثلة',
              icon: HeartHandshake,
              color: 'from-gray-600 to-gray-800',
            },
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-8 text-center text-white shadow-lg`}
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-white/20 p-4">
                    <StatIcon className="h-8 w-8" />
                  </div>
                </div>
                <div className="mb-2 text-5xl font-bold">{stat.number}</div>
                <div className="text-lg opacity-90" dir="rtl">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <NewsletterSection />
    </div>
  );
}

// Team Member Card Component
interface TeamMemberCardProps {
  member: TeamMember;
  sectionColor: string;
}

function TeamMemberCard({ member, sectionColor }: TeamMemberCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-visible rounded-2xl bg-white shadow-md"
    >
      {/* Header with Image */}
      <div
        className={`relative h-40 overflow-visible rounded-t-2xl bg-gradient-to-br ${sectionColor}`}
      >
        {/* Profile Image */}
        <div className="absolute left-1/2 top-16 -translate-x-1/2">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <img
              src={member.image_url || '/test-profile/image 14.png'}
              alt={member.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name
                )}&background=093059&color=fff&size=200`;
              }}
            />
          </div>
        </div>

        {/* Role Badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-[#093059]">
            {member.title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-20 text-right" dir="rtl">
        {/* Name */}
        <h3 className="mb-2 text-xl font-bold text-[#093059]">{member.name}</h3>

        {/* Role */}
        <p className="mb-3 text-sm font-medium text-[#b2823e]">{member.role}</p>

        {/* Description */}
        {member.description && (
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            {member.description}
          </p>
        )}

        {/* University and Country */}
        {(member.university || member.country) && (
          <div className="mb-4 space-y-2 border-t border-gray-200 pt-4">
            {member.university && (
              <div className="flex items-center justify-end gap-2 text-sm text-gray-700">
                <span>{member.university}</span>
                <Briefcase className="h-4 w-4 text-[#b2823e]" />
              </div>
            )}
            {member.country && (
              <div className="flex items-center justify-end gap-2 text-sm text-gray-700">
                <span>{member.country}</span>
                <svg
                  className="h-4 w-4 text-[#b2823e]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Email */}
        {member.email && (
          <motion.a
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
            href={`mailto:${member.email}`}
            className="flex items-center justify-end gap-2 text-sm text-gray-600 transition-colors hover:text-[#b2823e]"
          >
            <span className="truncate">{member.email}</span>
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

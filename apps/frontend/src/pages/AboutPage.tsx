import { Eye, Target, CheckCircle, BookOpen } from 'lucide-react';
import { SectionCard } from '../components/cards';
import { ListItem } from '../components/common';
import { aboutData } from '../data/aboutData';
import { useSiteSettings } from '../contexts';

export function AboutPage() {
  const { settings } = useSiteSettings();

  // Use settings or fallback to aboutData
  const displayIntro = settings?.about_intro ? [settings.about_intro] : aboutData.intro;
  const displayMission = settings?.mission || aboutData.mission;
  const displayVision = settings?.vision || aboutData.vision;
  const displayGoals = settings?.goals && settings.goals.length > 0 ? settings.goals : aboutData.goals;

  return (
    <div className="min-h-screen bg-white">
      <section className="py-8 sm:py-12 lg:py-16" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" >
          <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 lg:space-y-12" >
            {/* Page Header */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md mt-28">
              <div className="bg-[#b3b3b3] px-6 py-6 text-center sm:px-8 sm:py-8">
                <h1 className="mb-3 text-3xl font-bold text-[#093059] sm:text-4xl lg:text-5xl" dir="auto">
                  عن المجلة
                </h1>
                <p className="text-lg text-[#093059] sm:text-xl lg:text-2xl" dir="auto">
                  تعرف على رسالة المجلة ورؤيتها وأهدافها في خدمة المجتمع العلمي والأكاديمي
                </p>
              </div>

              {/* Introduction */}
              <div className="p-6 sm:p-8 lg:p-10">
                <ul className="space-y-4 list-inside" dir="rtl">
                  {displayIntro.map((paragraph, index) => (
                    <ListItem key={index}>{paragraph}</ListItem>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vision and Mission */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <SectionCard
                title="الرسالة"
                icon={<Target className="size-8 text-[#093059] sm:size-10" />}
                content={displayMission}
              />
              <SectionCard
                title="الرؤية"
                icon={<Eye className="size-8 text-[#093059] sm:size-10" />}
                content={displayVision}
              />
            </div>

            {/* Goals */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="flex items-center justify-end gap-3 bg-[#b3b3b3] px-6 py-4 sm:gap-4 sm:px-8">
                <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="auto">
                  أهداف المجلة
                </h2>
                <CheckCircle className="size-8 text-[#093059] sm:size-10" />
              </div>
              <div className="p-6 sm:p-8 lg:p-10">
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6" >
                  {displayGoals.map((goal, index) => (
                    <ListItem key={index}>{goal}</ListItem>
                  ))}
                </ul>
              </div>
            </div>

            {/* Publication Fields */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="flex items-center justify-end gap-3 bg-[#b3b3b3] px-6 py-4 sm:gap-4 sm:px-8">
                <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="auto">
                  مجالات النشر
                </h2>
                <BookOpen className="size-8 text-[#093059] sm:size-10" />
              </div>
              <div className="space-y-6 p-6 sm:p-8 lg:p-10" dir="rtl">
                <p className="text-right text-base font-bold leading-relaxed text-[#093059] sm:text-lg lg:text-xl">
                  تنشر (مجلة الدراسات والبحوث) الأبحاث العلمية الأصيلة والمبتكرة، في طيف واسع من التخصصات
                  الإنسانية والعلمية والتطبيقية، والتي تشمل على سبيل المثال لا الحصر:
                </p>
                <ul className="space-y-4 list-inside">
                  {/* Display all fields in order */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                    {aboutData.fields.map((field, index) => (
                      <ListItem key={index}>{field}</ListItem>
                    ))}
                  </div>
                </ul>
                <p className="text-right text-base font-bold leading-relaxed text-[#093059] sm:text-lg lg:text-xl">
                  · ملاحظة: ترحب المجلة أيضًا بالأبحاث متعددة التخصصات التي تجمع بين عدة مجالات معرفية (الدراسات
                  البيئية).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

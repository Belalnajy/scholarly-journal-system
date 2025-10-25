import { Shield, Mail } from 'lucide-react';
import { PrivacySection } from '../components/cards/PrivacySection';
import { privacyPolicyData } from '../data/privacyData';
import { NewsletterSection } from '../components';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Page Header */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md mt-28">
              <div className="bg-[#b3b3b3] px-6 py-6 text-center sm:px-8 sm:py-8">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#093059] p-4">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h1 className="mb-3 text-3xl font-bold text-[#093059] sm:text-4xl lg:text-5xl" dir="rtl">
                  {privacyPolicyData.title}
                </h1>
                <p className="text-base text-[#093059] sm:text-lg" dir="rtl">
                  {privacyPolicyData.lastUpdate}
                </p>
              </div>
            </div>

            {/* Privacy Sections */}
            {privacyPolicyData.sections.map((section) => (
              <PrivacySection
                key={section.id}
                title={section.title}
                icon={section.icon}
                content={section.content}
              />
            ))}

            {/* Contact Section */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="bg-gradient-to-br from-[#093059] to-[#0a4a7a] p-8 text-right text-white sm:p-10 lg:p-12" dir="rtl">
                <div className="mb-4 flex justify-end">
                  <Mail className="h-10 w-10 text-[#b2823e]" />
                </div>
                <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                  {privacyPolicyData.contact.title}
                </h2>
                <p className="mb-6 text-lg leading-relaxed opacity-90">
                  {privacyPolicyData.contact.description}
                </p>
                <a
                  href={`mailto:${privacyPolicyData.contact.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#b2823e] px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-[#9a6f35] hover:shadow-lg"
                >
                  <Mail className="h-5 w-5" />
                  <span>{privacyPolicyData.contact.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </div>
  );
}

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '../components/sections';
import { NewsletterSection } from '../components';
import { contactData } from '../data/contactData';
import { useSiteSettings } from '../contexts';

export function ContactPage() {
  const { settings } = useSiteSettings();

  // Use settings or fallback to contactData
  const displayEmail = settings?.contact_info?.email || contactData.contactInfo.email.items[0]?.value;
  const displayPhone = settings?.contact_info?.phone || contactData.contactInfo.phone.items[0]?.value;
  const displayAddress = settings?.contact_info?.address || contactData.contactInfo.address.items.join(', ');

  return (
    <div className="min-h-screen bg-white">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Page Header */}
            <div className="mt-28 overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="bg-[#b3b3b3] px-6 py-6 text-center sm:px-8 sm:py-8">
                <h1 className="mb-3 text-3xl font-bold text-[#093059] sm:text-4xl lg:text-5xl" dir="rtl">
                  {contactData.title}
                </h1>
                <p className="text-base text-[#093059] sm:text-lg lg:text-xl" dir="rtl">
                  {contactData.subtitle}
                </p>
              </div>
            </div>

            {/* Contact Form and Info Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <ContactForm formData={contactData.form} />

              {/* Contact Information */}
              <div className="space-y-6" >
                {/* Contact Info Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-md"> 
                  <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
                    <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" >
                      {contactData.contactInfo.email.title}
                    </h2>
                  </div>
                  <div className="space-y-4 p-6 sm:p-8" dir="rtl">
                    <div className="flex items-start justify-start gap-3">
                      <div className="text-right">
                        <p className="text-lg text-[#666666]">البريد الإلكتروني</p>
                        <a
                          href={`mailto:${displayEmail}`}
                          className="text-base font-medium text-[#093059] hover:text-[#b2823e] sm:text-lg"
                        >
                          {displayEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Info Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
                    <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
                      {contactData.contactInfo.phone.title}
                    </h2>
                  </div>
                  <div className="space-y-4 p-6 sm:p-8" dir="rtl">
                    <div className="flex items-start justify-start gap-3">
                      <div className="text-right">
                        <p className="text-sm text-[#666666]">رقم الهاتف</p>
                        <a
                          href={`tel:${displayPhone?.replace(/\s/g, '')}`}
                          className="text-base font-medium text-[#093059] hover:text-[#b2823e] sm:text-lg"
                        >
                          {displayPhone}
                        </a>
                      </div>
                      <Phone className="mt-1 size-5 flex-shrink-0 text-[#b2823e]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address and Working Hours */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Address Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
                      {contactData.contactInfo.address.title}
                    </h2>
                    <MapPin className="size-8 text-[#093059]" />
                  </div>
                </div>
                <div className="p-6 sm:p-8" dir="rtl">
                  <div className="space-y-2 text-right">
                    <p className="text-base leading-relaxed text-[#093059] sm:text-lg">
                      {displayAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
                      {contactData.workingHours.title}
                    </h2>
                    <Clock className="size-8 text-[#093059]" />
                  </div>
                </div>
                <div className="p-6 sm:p-8" dir="rtl">
                  <div className="space-y-4">
                    {contactData.workingHours.schedule.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <p className="text-base font-medium text-[#666666] sm:text-lg">{item.hours}</p>
                        <p className="text-base font-bold text-[#093059] sm:text-lg">{item.days}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="bg-[#b3b3b3] px-6 py-4 text-center sm:px-8">
                <h2 className="text-xl font-bold text-[#093059] sm:text-2xl lg:text-3xl" dir="rtl">
                  {contactData.location.title}
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex h-[400px] items-center justify-center rounded-xl bg-[#f5f7fa]">
                  <div className="text-center" dir="rtl">
                    <MapPin className="mx-auto mb-4 size-16 text-[#093059]" />
                    <p className="text-xl font-bold text-[#093059]">{contactData.location.mapTitle}</p>
                    <p className="mt-2 text-lg text-[#666666]">{contactData.location.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </div>
  );
}

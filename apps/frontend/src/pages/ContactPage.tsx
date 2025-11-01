import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { ContactForm } from '../components/sections';
import { NewsletterSection } from '../components';
import { contactData } from '../data/contactData';
import { useSiteSettings } from '../contexts';
import { motion } from 'framer-motion';

export function ContactPage() {
  const { settings } = useSiteSettings();

  // Use settings or fallback to contactData
  const displayEmail = settings?.contact_info?.email || contactData.contactInfo.email.items[0]?.value;
  const displayPhone = settings?.contact_info?.phone || contactData.contactInfo.phone.items[0]?.value;
  const displayAddress = settings?.contact_info?.address || contactData.contactInfo.address.items.join(', ');

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Page Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-28 overflow-hidden rounded-2xl bg-[#e8f0f8] shadow-sm"
            >
              <div className="px-6 py-8 text-center sm:px-8 sm:py-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <Mail className="size-10 text-[#093059]" />
                  <h1 className="text-3xl font-bold text-[#093059] sm:text-4xl lg:text-5xl" dir="rtl">
                    {contactData.title}
                  </h1>
                </motion.div>
                <motion.p 
                  className="text-base text-[#666666] sm:text-lg lg:text-xl max-w-2xl mx-auto" 
                  dir="rtl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {contactData.subtitle}
                </motion.p>
              </div>
            </motion.div>

            {/* Contact Form and Info Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ContactForm formData={contactData.form} />
              </motion.div>

              {/* Contact Information */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                {/* Contact Info Card */}
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                > 
                  <div className="bg-[#e8f0f8] px-6 py-4 sm:px-8">
                    <div className="flex items-center justify-center gap-3">
                      <Mail className="size-6 text-[#093059]" />
                      <h2 className="text-xl font-bold text-[#093059] sm:text-2xl" dir="rtl">
                        {contactData.contactInfo.email.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8" dir="rtl">
                    <div className="flex items-center gap-3">
                      <Mail className="size-5 text-[#b2823e]" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-[#666666] mb-1">البريد الإلكتروني</p>
                        <a
                          href={`mailto:${displayEmail}`}
                          className="text-base font-medium text-[#093059] hover:text-[#b2823e] sm:text-lg transition-colors"
                        >
                          {displayEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Phone Info Card */}
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <div className="bg-[#e8f0f8] px-6 py-4 sm:px-8">
                    <div className="flex items-center justify-center gap-3">
                      <Phone className="size-6 text-[#093059]" />
                      <h2 className="text-xl font-bold text-[#093059] sm:text-2xl" dir="rtl">
                        {contactData.contactInfo.phone.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8" dir="rtl">
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-[#b2823e]" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-[#666666] mb-1">رقم الهاتف</p>
                        <a
                          href={`tel:${displayPhone?.replace(/\s/g, '')}`}
                          className="text-base font-medium text-[#093059] hover:text-[#b2823e] sm:text-lg transition-colors"
                        >
                          {displayPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Address Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <div className="bg-[#e8f0f8] px-6 py-4 sm:px-8">
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="size-6 text-[#093059]" />
                  <h2 className="text-xl font-bold text-[#093059] sm:text-2xl" dir="rtl">
                    {contactData.contactInfo.address.title}
                  </h2>
                </div>
              </div>
              <div className="p-6 sm:p-8" dir="rtl">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-[#b2823e] mt-1" />
                  <div className="text-right flex-1">
                    <p className="text-base leading-relaxed text-[#666666] sm:text-lg">
                      {displayAddress}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* University Website Card */}
            {settings?.university_url && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="bg-gradient-to-r from-[#093059] to-[#0d4a7a] px-6 py-4 sm:px-8">
                  <div className="flex items-center justify-center gap-3">
                    <ExternalLink className="size-6 text-white" />
                    <h2 className="text-xl font-bold text-white sm:text-2xl" dir="rtl">
                      موقع الجامعة
                    </h2>
                  </div>
                </div>
                <div className="p-6 sm:p-8" dir="rtl">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="size-5 text-[#b2823e]" />
                    <div className="text-right flex-1">
                      <p className="text-sm text-[#666666] mb-2">زيارة الموقع الإلكتروني للجامعة</p>
                      <a
                        href={settings.university_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-base font-bold text-[#093059] hover:text-[#b2823e] sm:text-lg transition-colors underline"
                      >
                        {settings.university_url.replace(/^https?:\/\//, '')}
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </section>
      <NewsletterSection />
    </div>
  );
}

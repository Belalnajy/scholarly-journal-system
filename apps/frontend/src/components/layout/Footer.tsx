import {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  Copyright,
  Instagram,
  Send,
  MessageCircle,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../contexts';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinks {
  quickLinks: FooterLink[];
  forResearchers: FooterLink[];
  content: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface SiteInfo {
  name: string;
  description: string;
}

interface FooterProps {
  links: FooterLinks;
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  siteInfo: SiteInfo;
}

const socialIconMap: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
  telegram: Send,
  whatsapp_channel: MessageCircle,
};

export function Footer({
  links,
  socialLinks,
  contactInfo,
  siteInfo,
}: FooterProps) {
  const { settings } = useSiteSettings();

  // Use settings or fallback to props
  const displayContactInfo = {
    email: settings?.contact_info?.email || contactInfo.email,
    phone: settings?.contact_info?.phone || contactInfo.phone,
    address: settings?.contact_info?.address || contactInfo.address,
  };

  const displaySiteInfo = {
    name: settings?.site_name || siteInfo.name,
    description: settings?.about_intro || siteInfo.description,
  };

  const displayLogo = settings?.logo_url || '/journal-logo.png';

  // Build social links from settings
  const displaySocialLinks = [];
  if (settings?.social_links?.facebook) {
    displaySocialLinks.push({
      platform: 'facebook',
      url: settings.social_links.facebook,
    });
  }
  if (settings?.social_links?.twitter) {
    displaySocialLinks.push({
      platform: 'twitter',
      url: settings.social_links.twitter,
    });
  }
  if (settings?.social_links?.linkedin) {
    displaySocialLinks.push({
      platform: 'linkedin',
      url: settings.social_links.linkedin,
    });
  }
  if (settings?.social_links?.instagram) {
    displaySocialLinks.push({
      platform: 'instagram',
      url: settings.social_links.instagram,
    });
  }
  if (settings?.social_links?.youtube) {
    displaySocialLinks.push({
      platform: 'youtube',
      url: settings.social_links.youtube,
    });
  }
  if (settings?.social_links?.telegram) {
    displaySocialLinks.push({
      platform: 'telegram',
      url: settings.social_links.telegram,
    });
  }
  if (settings?.social_links?.whatsapp_channel) {
    displaySocialLinks.push({
      platform: 'whatsapp_channel',
      url: settings.social_links.whatsapp_channel,
    });
  }

  // Fallback to props if no settings social links
  const finalSocialLinks =
    displaySocialLinks.length > 0 ? displaySocialLinks : socialLinks;

  return (
    <footer className="w-full bg-[#05192e]">
      <div className="flex flex-col items-center gap-8 px-4 py-8 sm:gap-9 sm:px-6 sm:py-9 lg:gap-10 lg:px-10 lg:py-10">
        {/* Main Footer Content */}
        <div className="flex w-full max-w-[1360px] flex-col-reverse items-center gap-8 md:flex-row md:items-start md:justify-between lg:gap-12">
          {/* Links Sections */}
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3 sm:items-start sm:gap-6 md:w-auto md:gap-12 lg:gap-[140px] md:pt-[80px]">
            {/* Content Links */}
            <div className="flex flex-col  gap-4 sm:items-end sm:gap-5 lg:w-[115px] lg:gap-6">
              <h4
                className="text-base font-bold text-[#f8f3ec] sm:text-lg"
                dir="auto"
              >
                المحتوى
              </h4>
              <div className="flex w-full flex-col  gap-2  text-sm text-[#f8f3ec] sm:items-end sm:gap-3 sm:text-right sm:text-base">
                {links.content.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="w-full transition-colors hover:text-[#b2823e]"
                    dir="auto"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* For Researchers Links */}
            <div className="flex flex-col  gap-4 sm:items-end sm:gap-5 lg:w-[130px] lg:gap-6">
              <h4
                className="text-base font-bold text-[#f8f3ec] sm:text-lg"
                dir="auto"
              >
                للباحثين
              </h4>
              <div className="flex w-full flex-col  gap-2 text-sm text-[#f8f3ec] sm:items-end sm:gap-3 sm:text-right sm:text-base">
                {links.forResearchers.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="w-full transition-colors hover:text-[#b2823e]"
                    dir="auto"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col  gap-4 sm:items-end sm:gap-5 lg:w-[146px] lg:gap-6">
              <h4
                className="text-base font-bold text-[#f8f3ec] sm:text-lg"
                dir="auto"
              >
                روابط سريعة
              </h4>
              <div className="flex w-full flex-col  gap-2 text-sm text-[#f8f3ec] sm:items-end sm:gap-3 sm:text-right sm:text-base">
                {links.quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="w-full transition-colors hover:text-[#b2823e]"
                    dir="auto"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Site Info and Contact */}
          <div className="flex w-full flex-col items-end gap-6 md:w-auto md:max-w-md lg:w-[539px]">
            {/* Logo and Description */}
            <div className="flex w-full flex-col items-end gap-3">
              <div className="relative h-24 w-32 sm:h-28 sm:w-36 lg:h-[126px] lg:w-[166px]">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    alt={displaySiteInfo.name}
                    className="h-full w-full object-contain"
                    src={displayLogo}
                  />
                </div>
              </div>
              <p
                className="w-full text-right text-sm font-medium text-[#f8f3ec] sm:text-base"
                dir="auto"
              >
                {displaySiteInfo.description}
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex w-full flex-col items-end gap-3 md:w-auto">
              <div className="flex items-center gap-3">
                <p
                  className="text-right text-sm font-medium text-[#f8f3ec] sm:text-base"
                  dir="auto"
                >
                  {displayContactInfo.email}
                </p>
                <Mail className="size-5 text-[#b2823e] sm:size-6" />
              </div>

              <div className="flex items-center gap-3">
                <p
                  className="text-right text-sm font-medium text-[#f8f3ec] sm:text-base"
                  dir="auto"
                >
                  {displayContactInfo.phone}
                </p>
                <Phone className="size-5 text-[#b2823e] sm:size-6" />
              </div>

              {/* ISSN */}
              {settings?.journal_issn && (
                <div className="flex items-center gap-3">
                  <p
                    className="text-right text-sm font-medium text-[#b2823e] sm:text-base"
                    dir="ltr"
                  >
                    ISSN: {settings.journal_issn}
                  </p>
                  <Globe className="size-5 text-[#b2823e] sm:size-6" />
                </div>
              )}

              {/* University Website */}
              {settings?.university_url && (
                <a
                  href={settings.university_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <p className="text-right text-sm font-medium text-[#f8f3ec] hover:text-[#b2823e] transition-colors sm:text-base" dir="auto">
                    موقع الجامعة
                  </p>
                  <Globe className="size-5 text-[#b2823e] sm:size-6 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex w-full max-w-[1360px] flex-col items-start gap-4 sm:gap-5 lg:gap-6">
          <div className="h-[2px] w-full bg-[#b3b3b3]" />

          <div className="flex w-full flex-col-reverse items-center justify-between gap-4 px-0 py-2 sm:flex-row sm:items-end sm:gap-6">
            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 sm:w-auto sm:justify-start">
              {finalSocialLinks.map((social, index) => {
                const Icon = socialIconMap[social.platform];
                return (
                  <a
                    key={index}
                    href={social.url}
                    className="transition-transform hover:scale-110"
                    aria-label={social.platform}
                  >
                    {Icon && (
                      <Icon className="size-5 text-[#b2823e] sm:size-6" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Copyright and ISSN */}
            <div className="flex flex-col items-center gap-2 sm:items-end sm:gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <p
                  className="text-center text-xs font-medium text-[#f8f3ec] sm:text-right sm:text-sm"
                  dir="rtl"
                >
                  2024 {displaySiteInfo.name}. جميع الحقوق محفوظة.
                </p>
                <Copyright className="size-4 text-[#b2823e] sm:size-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

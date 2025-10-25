import { Mail, ExternalLink, Building2, MapPin } from 'lucide-react';

interface EditorCardProps {
  name: string;
  title: string;
  role: string;
  university: string;
  country: string;
  email: string;
  orcid: string;
  image: string;
}

export function EditorCard({
  name,
  title,
  role,
  university,
  country,
  email,
  orcid,
  image,
}: EditorCardProps) {
  const getRoleBadgeColor = (role: string) => {
    if (role === 'رئيس التحرير') return 'bg-[#093059] text-white';
    if (role === 'نائب رئيس التحرير') return 'bg-[#b2823e] text-white';
    return 'bg-gray-100 text-[#093059]';
  };

  return (
    <div className="group relative overflow-visible rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
      {/* Header with Image and Role Badge */}
      <div className="relative h-40 overflow-visible rounded-t-2xl bg-gradient-to-br from-[#093059] to-[#0a4a7a]">
        {/* Profile Image - positioned to overflow */}
        <div className="absolute left-1/2 top-16 -translate-x-1/2">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=093059&color=fff&size=200`;
              }}
            />
          </div>
        </div>
        
        {/* Role Badge */}
        <div className="absolute left-4 top-4">
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${getRoleBadgeColor(role)}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-20 text-right" dir="rtl">
        {/* Name */}
        <h3 className="mb-2 text-xl font-bold text-[#093059]">{name}</h3>

        {/* Title/Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600">{title}</p>

        {/* University and Country */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-end gap-2 text-sm text-gray-700">
            <span>{university}</span>
            <Building2 className="h-4 w-4 text-[#b2823e]" />
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-gray-700">
            <span>{country}</span>
            <MapPin className="h-4 w-4 text-[#b2823e]" />
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200"></div>

        {/* Contact Info */}
        <div className="space-y-2">
          {/* ORCID */}
          <a
            href={`https://orcid.org/${orcid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-end gap-2 text-sm text-gray-600 transition-colors hover:text-[#b2823e]"
          >
            <span className="font-mono">{orcid}</span>
            <ExternalLink className="h-4 w-4" />
            <span className="font-medium">ORCID:</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-end gap-2 text-sm text-gray-600 transition-colors hover:text-[#b2823e]"
          >
            <span className="truncate">{email}</span>
            <Mail className="h-4 w-4 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

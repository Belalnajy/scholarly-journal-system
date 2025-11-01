import { Calendar, Download, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Issue } from '../../services/issuesService';

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  // Format date
  const formattedDate = new Date(issue.publish_date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
  });

  // Calculate total downloads from articles only
  const articlesDownloads = issue.articles?.reduce((sum, article: any) => {
    return sum + (article.downloads_count || 0);
  }, 0) || 0;

  // Handle issue download
  const handleDownloadIssue = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    
    if (!issue.issue_pdf_url) return;
    
    try {
      // Increment download count
      try {
        const issuesService = await import('../../services/issuesService');
        await issuesService.default.incrementIssueDownloads(issue.id);
      } catch (err) {
        console.error('Failed to increment issue downloads:', err);
      }

      // Extract file extension from URL
      const getFileExtension = (url: string) => {
        const urlParts = url.split('?')[0].split('.');
        const ext = urlParts[urlParts.length - 1].toLowerCase();
        return ['pdf', 'doc', 'docx'].includes(ext) ? ext : 'pdf';
      };

      // Download the file
      const response = await fetch(issue.issue_pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = getFileExtension(issue.issue_pdf_url);
      link.download = `issue-${issue.issue_number}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(issue.issue_pdf_url, '_blank');
    }
  };
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm transition-all hover:shadow-lg">
      {/* Header with Status and Date */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-3">
        <span className={`rounded-lg px-3 py-1 text-sm text-white ${
          issue.status === 'published' ? 'bg-green-500' : 
          issue.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
        }`}>
          {issue.status === 'published' ? 'منشور' : 
           issue.status === 'in-progress' ? 'قيد الإعداد' : 'مخطط'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#858585]">
          <Calendar className="size-4" />
          <span dir="rtl">{formattedDate}</span>
        </div>
      </div>

      {/* Title and Issue Number */}
      <div className="flex flex-col gap-2 px-5 py-4 text-right" dir="rtl">
        <h3 className="text-lg font-semibold text-[#093059]">
          {issue.title}
        </h3>
        <p className="text-sm text-[#666666]">
          العدد {issue.issue_number}
        </p>
      </div>

      {/* Cover Image */}
      <div className="relative h-[220px] w-full overflow-hidden bg-gradient-to-br from-[#093059] to-[#0a3d6b] ">
        {issue.cover_image_url ? (
          <img
            src={issue.cover_image_url}
            alt={issue.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="w-20 h-20 text-white/30" />
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-4">
        <p className="line-clamp-3 text-right text-sm leading-relaxed text-[#666666]" dir="rtl">
          {issue.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-end gap-4 border-t border-[#e5e5e5] px-5 py-3 text-sm text-[#858585]">
        <div className="flex items-center gap-1">
          <span dir="rtl">{articlesDownloads} تحميل</span>
          <Download className="size-4" />
        </div>
        <div className="flex items-center gap-1">
          <span dir="rtl">{issue.total_articles || 0} مقال</span>
          <FileText className="size-4" />
        </div>
        <div className="flex items-center gap-1">
          <span dir="rtl">{issue.total_pages || 0} صفحة</span>
          <FileText className="size-4" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 px-5 pb-5">
        {/* Download Magazine Button - Only show if PDF exists */}
        {issue.issue_pdf_url ? (
          <button
            onClick={handleDownloadIssue}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2 transition-colors hover:bg-green-700"
          >
            <span className="text-sm text-white" dir="rtl">
              تحميل المجلة
            </span>
            <Download className="size-4 text-white" />
          </button>
        ) : (
          <Link 
            to={`/issues/${issue.id}`}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#093059] px-4 py-2 transition-colors hover:bg-[#0a3d6b]"
          >
            <span className="text-sm text-white" dir="rtl">
              عرض المقالات ({issue.total_articles})
            </span>
            <Eye className="size-4 text-white" />
          </Link>
        )}
        
        <Link 
          to={`/issues/${issue.id}`}
          className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#b2823e] px-4 py-2 transition-colors hover:bg-[#b2823e]"
        >
          <span className="text-sm text-[#b2823e] transition-colors group-hover:text-white" dir="rtl">
            عرض التفاصيل
          </span>
        </Link>
      </div>
    </div>
  );
}

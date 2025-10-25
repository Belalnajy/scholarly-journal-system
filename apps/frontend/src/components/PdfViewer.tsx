import { useState } from 'react';
import { Download, ExternalLink, Eye, Loader2 } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  fileName?: string;
  researchId?: string;
}

export function PdfViewer({ pdfUrl, fileName = 'document.pdf', researchId }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'embed' | 'iframe'>('iframe');

  const handleDownload = async () => {
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = pdfUrl + '?fl_attachment'; // Cloudinary attachment flag
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(pdfUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">معاينة ملف PDF</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            فتح في نافذة جديدة
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            تحميل PDF
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-gray-100" style={{ height: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">جاري تحميل الملف...</p>
            </div>
          </div>
        )}
        
        {viewMode === 'iframe' ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              console.error('Failed to load PDF in iframe');
            }}
          />
        ) : (
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Footer with info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 نصيحة: يمكنك استخدام أدوات التكبير والتصغير في شريط أدوات PDF للتحكم في العرض
        </p>
      </div>
    </div>
  );
}

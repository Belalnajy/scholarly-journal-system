import { X, Download, Maximize2, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  onClose: () => void;
}

export function PDFViewer({ pdfUrl, title = 'معاينة المستند', onClose }: PDFViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0D3B66] to-[#1a5490]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleFullscreen}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="ملء الشاشة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="تحميل"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="فتح في نافذة جديدة"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-red-500 rounded-lg transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-800 relative">
          <iframe
            id="pdf-iframe"
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title}
            style={{ 
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>نصيحة:</strong> استخدم Ctrl + F للبحث داخل المستند
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Keyboard shortcut: ESC to close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        tabIndex={0}
      />
    </div>
  );
}

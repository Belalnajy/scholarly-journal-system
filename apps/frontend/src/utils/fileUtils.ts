/**
 * Check if a file URL is a PDF
 */
export const isPdfFile = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  // Check file extension
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.pdf')) return true;
  
  // Check if URL contains .pdf before query parameters
  if (lowerUrl.includes('.pdf?')) return true;
  
  // For Cloudinary URLs, check the actual file extension in the URL path
  if (lowerUrl.includes('cloudinary.com')) {
    // Extract the file path from Cloudinary URL
    // Format: .../upload/v123456789/filename.ext or .../raw/upload/v123456789/filename.ext
    const match = lowerUrl.match(/\/upload\/[^/]+\/[^?]+/);
    if (match) {
      const filePath = match[0];
      return filePath.endsWith('.pdf');
    }
  }
  
  return false;
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url: string | undefined | null): string => {
  if (!url) return '';
  
  try {
    // Remove query parameters
    const urlWithoutParams = url.split('?')[0];
    
    // Get extension
    const parts = urlWithoutParams.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  } catch (error) {
    console.error('Error getting file extension:', error);
  }
  
  return '';
};

/**
 * Check if file is a document (PDF, DOC, DOCX)
 */
export const isDocumentFile = (url: string | undefined | null): boolean => {
  const extension = getFileExtension(url);
  return ['pdf', 'doc', 'docx'].includes(extension);
};

/**
 * Download file from Cloudinary with direct download
 * Uses fetch + blob to force download instead of opening
 */
export async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  try {
    // Add fl_attachment flag to Cloudinary URL
    const downloadUrl = fileUrl.includes('?') 
      ? `${fileUrl}&fl_attachment` 
      : `${fileUrl}?fl_attachment`;
    
    // Fetch the file as blob
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    
    const blob = await response.blob();
    
    // Create blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL after a short delay
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback: try direct download with fl_attachment
    const downloadUrl = fileUrl.includes('?') 
      ? `${fileUrl}&fl_attachment` 
      : `${fileUrl}?fl_attachment`;
    window.open(downloadUrl, '_blank');
  }
}

/**
 * Download PDF from research
 */
export async function downloadResearchPdf(
  cloudinaryUrl: string | undefined | null,
  fallbackUrl: string | undefined | null,
  researchNumber: string
): Promise<void> {
  const fileUrl = cloudinaryUrl || fallbackUrl;
  if (!fileUrl) {
    throw new Error('لا يوجد ملف للتحميل');
  }
  
  await downloadFile(fileUrl, `${researchNumber}.pdf`);
}

/**
 * Download revision file
 */
export async function downloadRevisionFile(
  cloudinaryUrl: string | undefined | null,
  fallbackUrl: string | undefined | null,
  revisionNumber: number
): Promise<void> {
  const fileUrl = cloudinaryUrl || fallbackUrl;
  if (!fileUrl) {
    throw new Error('لا يوجد ملف للتحميل');
  }
  
  await downloadFile(fileUrl, `revision-${revisionNumber}.pdf`);
}

/**
 * Download supplementary file
 */
export async function downloadSupplementaryFile(
  cloudinaryUrl: string | undefined | null,
  fallbackUrl: string | undefined | null,
  fileName: string
): Promise<void> {
  const fileUrl = cloudinaryUrl || fallbackUrl;
  if (!fileUrl) {
    throw new Error('لا يوجد ملف للتحميل');
  }
  
  await downloadFile(fileUrl, fileName);
}

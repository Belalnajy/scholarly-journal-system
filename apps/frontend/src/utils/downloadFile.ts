/**
 * Download file from Cloudinary with direct download
 * Uses fetch + blob to force download instead of opening
 */
export async function downloadFile(
  fileUrl: string,
  fileName: string
): Promise<void> {
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
 * Get file extension from URL
 */
function getFileExtensionFromUrl(url: string): string {
  try {
    // Extract the format from Cloudinary URL (e.g., .pdf, .docx, .doc)
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    // Default to pdf if no extension found
    return 'pdf';
  } catch {
    return 'pdf';
  }
}

/**
 * Download research file (PDF or Word)
 */
export async function downloadResearchPdf(
  cloudinaryUrl: string | undefined | null,
  fallbackUrl: string | undefined | null,
  researchNumber: string,
  fileType?: string | null
): Promise<void> {
  const fileUrl = cloudinaryUrl || fallbackUrl;
  if (!fileUrl) {
    throw new Error('لا يوجد ملف للتحميل');
  }

  // Use provided file type or detect from URL
  const extension = fileType || getFileExtensionFromUrl(fileUrl);
  await downloadFile(fileUrl, `${researchNumber}.${extension}`);
}

/**
 * Download revision file (PDF or Word)
 */
export async function downloadRevisionFile(
  cloudinaryUrl: string | undefined | null,
  fallbackUrl: string | undefined | null,
  revisionNumber: number,
  fileType?: string | null
): Promise<void> {
  const fileUrl = cloudinaryUrl || fallbackUrl;
  if (!fileUrl) {
    throw new Error('لا يوجد ملف للتحميل');
  }

  // Use provided file type or detect from URL
  const extension = fileType || getFileExtensionFromUrl(fileUrl);
  await downloadFile(fileUrl, `revision-${revisionNumber}.${extension}`);
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

/**
 * Download acceptance certificate
 */
export async function downloadAcceptanceCertificate(
  certificateUrl: string,
  researchNumber: string
): Promise<void> {
  if (!certificateUrl) {
    throw new Error('شهادة القبول غير متوفرة');
  }

  // Fix old authenticated URLs by converting to public URLs
  let fixedUrl = certificateUrl;
  if (certificateUrl.includes('/authenticated/')) {
    // Convert: /raw/authenticated/s--xxx--/v1/certificates/file.pdf/id
    // To: /raw/upload/v1/certificates/file
    fixedUrl = certificateUrl
      .replace(/\/authenticated\/s--[^/]+--\//, '/upload/')
      .replace(/\.pdf\/[^?]+/, '.pdf');
  }

  await downloadFile(fixedUrl, `acceptance-certificate-${researchNumber}.pdf`);
}

/**
 * File validation and formatting utilities
 */

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,      // 5 MB
  document: 10 * 1024 * 1024,  // 10 MB
  video: 100 * 1024 * 1024,    // 100 MB
  default: 25 * 1024 * 1024,   // 25 MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
};

/**
 * Format file size to human-readable format (KB/MB/GB)
 * 
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  if (bytes < 0) {
    throw new Error('File size cannot be negative');
  }

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  
  // Find the appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Ensure we don't exceed our units array
  const unitIndex = Math.min(i, units.length - 1);
  
  // Calculate the value in the appropriate unit
  const value = bytes / Math.pow(k, unitIndex);
  
  // Format with appropriate decimal places
  // 0 decimal places for bytes, 1 for KB, 2 for MB and above
  let decimals = 0;
  if (unitIndex === 1) decimals = 1;  // KB
  if (unitIndex >= 2) decimals = 2;   // MB, GB, TB
  
  return value.toFixed(decimals) + ' ' + units[unitIndex];
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(fileType);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Determine file category based on MIME type
 */
export function getFileCategory(mimeType: string): string {
  if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_FILE_TYPES.document.includes(mimeType)) return 'document';
  if (ALLOWED_FILE_TYPES.spreadsheet.includes(mimeType)) return 'spreadsheet';
  if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return 'video';
  return 'unknown';
}

/**
 * Get maximum file size for a given category
 */
export function getMaxSizeForCategory(category: string): number {
  switch (category) {
    case 'image':
      return MAX_FILE_SIZES.image;
    case 'video':
      return MAX_FILE_SIZES.video;
    case 'document':
    case 'spreadsheet':
      return MAX_FILE_SIZES.document;
    default:
      return MAX_FILE_SIZES.default;
  }
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
  } = {}
): { valid: boolean; error?: string } {
  const category = getFileCategory(file.type);
  const maxSize = options.maxSize || getMaxSizeForCategory(category);
  const allowedTypes = options.allowedTypes || [
    ...ALLOWED_FILE_TYPES.image,
    ...ALLOWED_FILE_TYPES.document,
    ...ALLOWED_FILE_TYPES.spreadsheet,
    ...ALLOWED_FILE_TYPES.video,
  ];

  // Validate file type
  if (!validateFileType(file.type, allowedTypes)) {
    return {
      valid: false,
      error: 'File type "' + file.type + '" is not allowed. Allowed types: ' + allowedTypes.join(', '),
    };
  }

  // Validate file size
  if (!validateFileSize(file.size, maxSize)) {
    return {
      valid: false,
      error: 'File size (' + formatFileSize(file.size) + ') exceeds maximum allowed size (' + formatFileSize(maxSize) + ')',
    };
  }

  return { valid: true };
}

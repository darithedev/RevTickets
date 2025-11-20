import { apiClient } from './client';
import { API_ENDPOINTS } from '../../constants';
import { formatFileSize, validateFile } from '../utils/fileValidation';

export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export const filesApi = {
  /**
   * Upload a file
   */
  async upload(file: File, ticketId?: string): Promise<FileUploadResponse> {
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (ticketId) {
      formData.append('ticketId', ticketId);
    }

    const response = await apiClient.post(API_ENDPOINTS.FILES?.UPLOAD || '/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Add formatted file size to response
    return {
      ...response,
      sizeFormatted: formatFileSize(response.size),
    };
  },

  /**
   * Get file metadata by ID
   */
  async getById(fileId: string): Promise<FileMetadata> {
    const response = await apiClient.get(API_ENDPOINTS.FILES?.BY_ID?.(fileId) || '/api/files/' + fileId);
    
    // Add formatted file size to response
    return {
      ...response,
      sizeFormatted: formatFileSize(response.size),
    };
  },

  /**
   * Get all files for a ticket
   */
  async getByTicket(ticketId: string): Promise<FileMetadata[]> {
    const response = await apiClient.get(API_ENDPOINTS.FILES?.BY_TICKET?.(ticketId) || '/api/tickets/' + ticketId + '/files');
    
    // Add formatted file size to each file
    return response.map((file: FileMetadata) => ({
      ...file,
      sizeFormatted: formatFileSize(file.size),
    }));
  },

  /**
   * Delete a file
   */
  async delete(fileId: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.FILES?.BY_ID?.(fileId) || '/api/files/' + fileId);
  },

  /**
   * Download a file
   */
  async download(fileId: string): Promise<Blob> {
    const response = await apiClient.get(API_ENDPOINTS.FILES?.DOWNLOAD?.(fileId) || '/api/files/' + fileId + '/download', {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * Format a file size in bytes to human-readable format
   * Utility function exposed from the API module
   */
  formatSize(bytes: number): string {
    return formatFileSize(bytes);
  },
};

// Re-export formatFileSize for convenience
export { formatFileSize };

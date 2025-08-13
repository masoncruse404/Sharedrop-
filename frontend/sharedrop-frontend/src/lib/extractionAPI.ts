import api from './api';
import type { ExtractionInfo, ExtractionResponse } from '../types/extraction';

export const extractionAPI = {
  getFileExtractionInfo: async (fileId: number): Promise<ExtractionInfo> => {
    const response = await api.get(`/files/${fileId}/extraction-info`);
    return response.data;
  },

  extractMetadata: async (fileId: number): Promise<ExtractionResponse> => {
    const response = await api.post(`/files/${fileId}/extract/metadata`);
    return response.data;
  },

  extractHighlights: async (fileId: number): Promise<ExtractionResponse> => {
    const response = await api.post(`/files/${fileId}/extract/highlights`);
    return response.data;
  },
};

import apiClient from "../client";

export const bulkService = {
  downloadTemplate: async () => {
    const response = await apiClient.get('/admin/bulk/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  uploadMapping: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ status: string; data: any }>('/admin/bulk/map-cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

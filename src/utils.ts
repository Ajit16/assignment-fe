import axios from "axios";

// Create axios instance with base config
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': import.meta.env.VITE_MASTER_KEY,
    'X-Access-Key': import.meta.env.VITE_X_ACCESS_KEY,
  },
  withCredentials: false,
});

// Fetch files from bin
export const getFiles = async () => {
  try {
    const { data } = await api.get(`/b/${import.meta.env.VITE_BIN_ID}`);
    return data.record as File[];// JSONBin wraps data in .record
  } catch (error) {
    console.error('Error fetching files:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch files');
    }
    throw new Error('Failed to fetch files');
  }
};

// Update data in bin
export const updateData = async (files: File[]) => {
  try {
    const { data } = await api.put(
      `/b/${import.meta.env.VITE_BIN_ID}`, { files }
    );
    return data.record; // Return updated data
  } catch (error) {
    console.error('Error updating data:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update data');
    }
    throw new Error('Failed to update data');
  }
};

// Bonus: Other common operations
export const createBin = async (initialData: any) => {
  const { data } = await api.post('/b', initialData);
  return data.metadata.id; // Returns new bin ID
};

export const deleteBin = async () => {
  await api.delete(`/b/${import.meta.env.VITE_BIN_ID}`);
};

export default api;
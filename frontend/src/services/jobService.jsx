import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getJobs = async () => {
  try {
    const response = await api.get('/jobs/');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const searchJobs = async (filters = {}) => {
  try {
    const response = await api.get('/jobs/search', {
      params: {
        keyword: filters.keyword,
        location: filters.location,
        department: filters.department,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

export const getJob = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job with ID ${id}:`, error);
    throw error;
  }
};

export const createJob = async (data) => {
  try {
    const response = await api.post('/jobs/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const updateJob = async (id, data) => {
  try {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating job with ID ${id}:`, error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getJobs,
  searchJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
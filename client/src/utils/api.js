import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Auth expired, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (err, fallback) => {
  const { response } = err;
  if (!response) {
    return err.message === 'Network Error' ? 'Cannot reach server' : fallback;
  }
  if (typeof response.data === 'string') {
    return `API not reachable (HTTP ${response.status})`;
  }
  return response.data?.msg || fallback;
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateDefaultRoutine: (data) => api.put('/auth/default-routine', data),
};

export const tasksAPI = {
  getTasks: (date) => api.get(`/tasks/${date}`),
  createTasks: (data) => api.post('/tasks', data),
  createSingleTask: (data) => api.post('/tasks/single', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateTaskFields: (data) => api.put('/tasks/update', data),
  updateOrCreate: (data) => api.post('/tasks/update-or-create', data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  bulkCreate: (tasks) => api.post('/tasks/bulk', { tasks }),
};

export const notesAPI = {
  getNote: (date) => api.get(`/notes/${date}`),
  createNote: (data) => api.post('/notes', data),
  getAllNotes: () => api.get('/notes'),
};

export const goalsAPI = {
  getGoals: (type) => api.get(`/goals${type ? `?type=${type}` : ''}`),
  createGoal: (data) => api.post('/goals', data),
  createBulkGoals: (data) => api.post('/goals/bulk', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const performanceAPI = {
  getDaily: (params) => api.get('/performance/daily', { params }),
  getWeekly: (weeks) => api.get('/performance/weekly', { params: { weeks } }),
  getStats: () => api.get('/performance/stats'),
  getHeatmap: (days) => api.get('/performance/heatmap', { params: { days } }),
};

export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  getBadges: () => api.get('/gamification/badges'),
  taskCompleted: (taskId, completedEarly) => api.post('/gamification/task-completed', { taskId, completedEarly }),
  focusCompleted: (minutes) => api.post('/gamification/focus-completed', { minutes }),
  perfectDay: () => api.post('/gamification/perfect-day'),
  getLeaderboard: () => api.get('/gamification/leaderboard'),
};

export const focusAPI = {
  start: (taskId, type, date) => api.post('/focus/start', { taskId, type, date }),
  end: (id) => api.put(`/focus/${id}/end`),
  getToday: () => api.get('/focus/today'),
  getStats: (days) => api.get('/focus/stats', { params: { days } }),
};

export const insightsAPI = {
  getDaily: (days) => api.get('/insights/daily', { params: { days } }),
  getPredictions: () => api.get('/insights/predictions'),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const exportAPI = {
  getAll: (days) => api.get('/export/all', { params: { days } }),
  getCsv: (days) => api.get('/export/csv/tasks', { params: { days } }),
  getSummary: () => api.get('/export/summary'),
};

export const chatAPI = {
  send: (message, history) => api.post('/chat', { message, history }),
};

export const eventsAPI = {
  create: (data) => api.post('/events', data),
  getByDate: (date) => api.get(`/events/${date}`),
  getByMonth: (year, month) => api.get(`/events/month/${year}/${month}`),
  search: (q, category) => api.get('/events/search', { params: { q, category } }),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export default api;
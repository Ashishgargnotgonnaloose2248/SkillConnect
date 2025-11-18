import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  linkedin?: string;
  skillsOffered: Skill[];
  skillsSeeking: Skill[];
  isVerified: boolean;
  // availability
  isAvailable?: boolean;
  availabilityMode?: 'online' | 'on-campus';
  availabilityLocation?: string;
  // Faculty-specific availability
  currentStatus?: 'free' | 'busy' | 'in-class' | 'unavailable';
  dailyAvailability?: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  teacher: User;
  student: User;
  skill: Skill;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  sessionType: 'in-person' | 'online' | 'hybrid';
  location?: string;
  meetingLink?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  teacherNotes?: string;
  studentNotes?: string;
  teacherRating?: number;
  studentRating?: number;
  teacherFeedback?: string;
  studentFeedback?: string;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth API
export const authAPI = {
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    linkedin?: string;
  }) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),
};

// Public API
export const publicAPI = {
  getStats: () => api.get<ApiResponse<{
    users: { total: number; active: number };
    skills: { total: number };
    sessions: { total: number; completed: number };
  }>>('/healthcheck/stats'),
};

// User API
export const userAPI = {
  getProfile: () => api.get<ApiResponse<User>>('/user/profile'),
  
  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/user/profile', data),
  
  addOfferedSkill: (skillId: string) =>
    api.post<ApiResponse<User>>('/user/skills/offered', { skillId }),
  
  addSeekingSkill: (skillId: string) =>
    api.post<ApiResponse<User>>('/user/skills/seeking', { skillId }),
  
  removeOfferedSkill: (skillId: string) =>
    api.delete<ApiResponse<User>>(`/user/skills/offered/${skillId}`),
  
  removeSeekingSkill: (skillId: string) =>
    api.delete<ApiResponse<User>>(`/user/skills/seeking/${skillId}`),
  
  getUsersBySkill: (skillId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ skill: Skill; users: User[]; pagination: any }>>(
      `/user/skills/${skillId}/users`,
      { params }
    ),
  
  // Faculty availability
  getAllFaculty: (params?: { status?: string; mode?: string }) =>
    api.get<ApiResponse<{ faculty: User[] }>>('/user/faculty', { params }),
  
  updateCurrentStatus: (currentStatus: 'free' | 'busy' | 'in-class' | 'unavailable') =>
    api.put<ApiResponse<User>>('/user/faculty/status', { currentStatus }),
  
  updateDailyAvailability: (dailyAvailability: User['dailyAvailability']) =>
    api.put<ApiResponse<User>>('/user/faculty/availability', { dailyAvailability }),
};

// Skills API
export const skillsAPI = {
  getAll: (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{ skills: Skill[]; pagination: any }>>('/skills', { params }),
  
  getById: (id: string) => api.get<ApiResponse<Skill>>(`/skills/${id}`),
  
  create: (data: {
    name: string;
    category: string;
    description: string;
    difficulty?: string;
    tags?: string[];
  }) => api.post<ApiResponse<Skill>>('/skills', data),
  
  update: (id: string, data: Partial<Skill>) =>
    api.put<ApiResponse<Skill>>(`/skills/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse<null>>(`/skills/${id}`),
  
  getCategories: () => api.get<ApiResponse<string[]>>('/skills/categories'),
  
  getPopular: (limit?: number) =>
    api.get<ApiResponse<Skill[]>>('/skills/popular', { params: { limit } }),
};

// Matching API
export const matchingAPI = {
  getMatches: (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{
    matches: Array<{
      user: User;
      matchType: 'teaching_opportunity' | 'learning_opportunity' | 'mutual_exchange';
      commonSkills?: Skill[];
      skillsICanTeach?: Skill[];
      skillsIWantToLearn?: Skill[];
      compatibilityScore: number;
    }>;
    totalMatches: number;
    pagination: any;
    userSkills: {
      offered: Skill[];
      seeking: Skill[];
    };
  }>>('/matching/matches', { params }),
  
  getSkillPartners: (skillId: string, params?: {
    matchType?: 'teachers' | 'learners' | 'all';
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{
    skill: Skill;
    partners: Array<{
      user: User;
      matchType: 'teacher' | 'learner';
      skill: Skill;
    }>;
    totalPartners: number;
    pagination: any;
  }>>(`/matching/skills/${skillId}/partners`, { params }),
  
  getStats: () => api.get<ApiResponse<{
    userStats: {
      offeredSkills: number;
      seekingSkills: number;
    };
    matchingOpportunities: {
      teachingOpportunities: number;
      learningOpportunities: number;
      mutualExchanges: number;
      totalOpportunities: number;
    };
    skillCategories: {
      offered: Record<string, number>;
      seeking: Record<string, number>;
    };
  }>>('/matching/stats'),
};

// Sessions API
export const sessionsAPI = {
  create: (data: {
    student: string;
    skill: string;
    title: string;
    description: string;
    scheduledDate: string;
    duration: number;
    sessionType?: string;
    location?: string;
    meetingLink?: string;
  }) => api.post<ApiResponse<Session>>('/sessions', data),
  
  getAll: (params?: {
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{ sessions: Session[]; pagination: any }>>('/sessions', { params }),
  
  getById: (id: string) => api.get<ApiResponse<Session>>(`/sessions/${id}`),
  
  update: (id: string, data: Partial<Session>) =>
    api.put<ApiResponse<Session>>(`/sessions/${id}`, data),
  
  confirm: (id: string) => api.patch<ApiResponse<Session>>(`/sessions/${id}/confirm`),
  
  cancel: (id: string, data?: { reason?: string }) =>
    api.patch<ApiResponse<Session>>(`/sessions/${id}/cancel`, data),
  
  complete: (id: string, data?: { notes?: string; rating?: number }) =>
    api.patch<ApiResponse<Session>>(`/sessions/${id}/complete`, data),
  
  getStats: () => api.get<ApiResponse<{
    totalSessions: number;
    completedSessions: number;
    pendingSessions: number;
    confirmedSessions: number;
    averageRatings: {
      asTeacher: number;
      asStudent: number;
    };
  }>>('/sessions/stats'),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    verified?: boolean;
  }) => api.get<ApiResponse<{ users: User[]; pagination: any }>>('/admin/users', { params }),
  
  verifyUser: (id: string) => api.patch<ApiResponse<User>>(`/admin/users/${id}/verify`),
  
  deactivateUser: (id: string) => api.patch<ApiResponse<User>>(`/admin/users/${id}/deactivate`),
  
  getPendingSkills: () => api.get<ApiResponse<Skill[]>>('/admin/skills/pending'),
  
  approveSkill: (id: string) => api.patch<ApiResponse<Skill>>(`/admin/skills/${id}/approve`),
  
  rejectSkill: (id: string, data?: { reason?: string }) =>
    api.delete<ApiResponse<null>>(`/admin/skills/${id}/reject`, { data }),
  
  getStats: () => api.get<ApiResponse<{
    users: { total: number; verified: number };
    skills: { total: number; active: number };
    sessions: { total: number; completed: number };
  }>>('/admin/stats'),
  
  removeContent: (data: { contentId: string; type: 'session' | 'skill' | 'user' }) =>
    api.post<ApiResponse<null>>('/admin/content/remove', data),
};

export default api;


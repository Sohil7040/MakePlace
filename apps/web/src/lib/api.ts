const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type Role = 'admin' | 'mentor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

export interface Student {
  id: string;
  userId?: string | null;
  fullName: string;
  age: number;
  contact: string;
  email: string;
  photo?: string | null;
  programId: string;
  studioId: string;
  mentorId?: string | null;
  xp: number;
  createdAt: string;
  program?: { id: string; name: string; description?: string };
  studio?: { id: string; name: string };
  portfolio?: Portfolio;
  projects?: Project[];
  badgeAwards?: BadgeAward[];
  mentor?: { name: string };
  reports?: Report[];
}

export interface Program {
  id: string;
  name: string;
  description?: string;
}

export interface Studio {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  tags: string[];
  status: 'draft' | 'published';
  phase?: 'idea' | 'research' | 'design' | 'build' | 'testing' | 'completed';
  publishedAt?: string | null;
  createdAt: string;
  media?: ProjectMedia[];
  journals?: any[];
  student?: { id: string; fullName: string };
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'image' | 'video' | 'file';
  url: string;
  caption?: string | null;
}

export interface PortfolioContent {
  about: string;
  projects: Array<{ 
    id?: string;
    title: string; 
    description: string; 
    highlights?: string[];
    mediaUrls?: string[];
    story?: {
      problem: string;
      idea: string;
      process: string;
      challenges: string;
      solution: string;
      learning: string;
    };
  }>;
  skills: string[];
  highlights: string[];
}

export interface Portfolio {
  id: string;
  studentId: string;
  content?: PortfolioContent | null;
  conversation?: Array<{ role: string; content: string }>;
  publicSlug: string;
  published: boolean;
  theme: string;
  publishedAt?: string | null;
  lastGeneratedAt?: string | null;
  student?: Student;
}

export interface Report {
  id: string;
  studentId: string;
  mentorId: string;
  content: string;
  weekOf: string;
  sentToParent: boolean;
  mentor?: { name: string };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface BadgeAward {
  id: string;
  studentId: string;
  badgeId: string;
  awardedBy: string;
  awardedAt: string;
  note?: string | null;
  badge?: Badge;
  mentor?: { name: string };
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string | null;
  createdAt: string;
  student?: { fullName: string; email: string; program?: { name: string } };
}

export interface Comment {
  id: string;
  authorId: string;
  targetType: 'project' | 'portfolio';
  targetId: string;
  content: string;
  createdAt: string;
  author?: { id: string; name: string; role: Role };
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; password: string; role?: Role }) =>
    api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => api<{ user: User & { student?: Student } }>('/api/auth/me'),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api<{ success: boolean }>('/api/auth/password', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const studentsApi = {
  list: () => api<{ students: Student[] }>('/api/students'),
  get: (id: string) => api<{ student: Student }>(`/api/students/${id}`),
  me: () => api<{ student: Student }>('/api/students/me'),
  create: (data: Partial<Student>) =>
    api<{ student: Student }>('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Student>) =>
    api<{ student: Student }>(`/api/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/students/${id}`, { method: 'DELETE' }),
};

export const programsApi = {
  list: () => api<{ programs: Program[] }>('/api/programs'),
};

export const studiosApi = {
  list: () => api<{ studios: Studio[] }>('/api/studios'),
};

export const projectsApi = {
  list: () => api<{ projects: Project[] }>('/api/projects'),
  explore: () => api<{ projects: (Project & { _count: { sparks: number } })[] }>('/api/projects/explore'),
  get: (id: string) => api<{ project: Project }>(`/api/projects/${id}`),
  listByStudent: (studentId: string) =>
    api<{ projects: Project[] }>(`/api/students/${studentId}/projects`),
  create: (studentId: string, data: Partial<Project>) =>
    api<{ project: Project }>(`/api/students/${studentId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Project>) =>
    api<{ project: Project }>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  addMedia: (projectId: string, data: { type: string; url: string; caption?: string }) =>
    api<{ media: ProjectMedia }>(`/api/projects/${projectId}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMedia: (projectId: string, mediaId: string) =>
    api<void>(`/api/projects/${projectId}/media/${mediaId}`, { method: 'DELETE' }),
  spark: (projectId: string) =>
    api<{ success: boolean; sparked: boolean }>(`/api/projects/${projectId}/spark`, { method: 'POST', body: JSON.stringify({}) }),
  getCollaborators: (id: string) => 
    api<{ collaborators: any[] }>(`/api/projects/${id}/collaborators`),
  addCollaborator: (id: string, studentId: string) => 
    api<{ collaborator: any }>(`/api/projects/${id}/collaborators`, { method: 'POST', body: JSON.stringify({ studentId }) }),
  removeCollaborator: (id: string, collaboratorId: string) => 
    api<void>(`/api/projects/${id}/collaborators/${collaboratorId}`, { method: 'DELETE' }),
};

export const portfolioApi = {
  getPublic: (slug: string) => api<{ portfolio: Portfolio }>(`/api/portfolio/public/${slug}`),
  get: (studentId: string) => api<{ portfolio: Portfolio }>(`/api/students/${studentId}/portfolio`),
  generate: (studentId: string) =>
    api<{ portfolio: Portfolio }>(`/api/students/${studentId}/portfolio/generate`, { method: 'POST', body: JSON.stringify({}) }),
  chat: (studentId: string, message: string) =>
    api<{ portfolio: Portfolio }>(`/api/students/${studentId}/portfolio/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  publish: (studentId: string, published: boolean) =>
    api<{ portfolio: Portfolio }>(`/api/students/${studentId}/portfolio/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ published }),
    }),
  updateTheme: (studentId: string, theme: string) =>
    api<{ portfolio: Portfolio }>(`/api/students/${studentId}/portfolio/theme`, {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    }),
};

export const aiApi = {
  scrapYard: (parts: string) =>
    api<{ ideas: string }>('/api/ai/scrap-yard', {
      method: 'POST',
      body: JSON.stringify({ parts }),
    }),
};

export const mentorApi = {
  listMentors: () => api<{ mentors: User[] }>('/api/mentors'),
  createMentor: (data: { name: string; email: string }) =>
    api<{ mentor: User }>('/api/mentors', { method: 'POST', body: JSON.stringify(data) }),
  deleteMentor: (id: string) => api<void>(`/api/mentors/${id}`, { method: 'DELETE', body: JSON.stringify({}) }),
  getReports: (studentId: string) => api<{ reports: Report[] }>(`/api/students/${studentId}/reports`),
  createReport: (studentId: string, data: { content: string; weekOf: string; sentToParent?: boolean }) =>
    api<{ report: Report }>(`/api/students/${studentId}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReport: (id: string, data: Partial<{ content: string; weekOf: string; sentToParent: boolean }>) =>
    api<{ report: Report }>(`/api/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getBadges: () => api<{ badges: Badge[] }>('/api/badges'),
  awardBadge: (studentId: string, data: { badgeId: string; note?: string }) =>
    api<{ award: BadgeAward }>(`/api/students/${studentId}/badges`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getComments: (targetType: string, targetId: string) =>
    api<{ comments: Comment[] }>(`/api/comments?targetType=${targetType}&targetId=${targetId}`),
  createComment: (data: { targetType: string; targetId: string; content: string }) =>
    api<{ comment: Comment }>('/api/comments', { method: 'POST', body: JSON.stringify(data) }),
  createBadge: (data: Partial<Badge>) =>
    api<{ badge: Badge }>('/api/badges', { method: 'POST', body: JSON.stringify(data) }),
};

export const feesApi = {
  list: () => api<{ fees: Fee[] }>('/api/fees'),
  create: (data: { studentId: string; amount: number; description: string; dueDate: string }) =>
    api<{ fee: Fee }>('/api/fees', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: 'pending' | 'paid' | 'overdue') =>
    api<{ fee: Fee }>(`/api/fees/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const tasksApi = {
  listByProject: (projectId: string) => api<any[]>(`/api/projects/${projectId}/tasks`),
  create: (projectId: string, data: { title: string; status: string }) =>
    api<any>(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api<any>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
};

export const journalsApi = {
  listByStudent: (studentId: string, projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return api<any[]>(`/api/students/${studentId}/journals${qs}`);
  },
  create: (studentId: string, data: { title: string; projectId?: string; canvasData?: any }) =>
    api<any>(`/api/students/${studentId}/journals`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api<any>(`/api/journals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/api/journals/${id}`, { method: 'DELETE' }),
};

export const uploadApi = {
  getMode: () => api<{ mode: 'local' | 'r2' }>('/api/upload/mode'),
  presign: (filename: string, contentType: string, folder?: string) =>
    api<{ uploadUrl: string; publicUrl: string; key: string }>('/api/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, folder }),
    }),
  uploadFile: async (file: File, folder?: string) => {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      throw new ApiError(400, 'File size exceeds the 50MB limit');
    }

    const { mode } = await uploadApi.getMode();

    if (mode === 'r2') {
      const { uploadUrl, publicUrl } = await uploadApi.presign(file.name, file.type, folder);
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!s3Res.ok) throw new ApiError(s3Res.status, 'Cloud upload failed');
      return publicUrl;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await fetch(`${API_URL}/api/upload${query}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(res.status, body.error || 'Upload failed');
    }

    const { publicUrl } = await res.json();
    return publicUrl as string;
  },
};

export { ApiError };

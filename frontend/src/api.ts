const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('未登录');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

export const api = {
  register: (username: string, password: string, gradeLevel: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, gradeLevel }) }),

  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  submitDiagnosis: (answers: any) =>
    request('/diagnosis/submit', { method: 'POST', body: JSON.stringify({ answers }) }),

  getProfile: () => request('/diagnosis/profile'),

  setGoal: (goal: { targetExam: string; targetScore?: number; deadline: string; dailyBudgetMinutes: number }) =>
    request('/schedule/goal', { method: 'POST', body: JSON.stringify(goal) }),

  getToday: () => request('/schedule/today'),

  getWeek: () => request('/schedule/week'),

  completeBlock: (logId: string, actualMinutes: number, status: 'done' | 'skipped', knowledgePointId?: string) =>
    request('/schedule/complete-block', { method: 'POST', body: JSON.stringify({ logId, actualMinutes, status, knowledgePointId }) }),

  getKnowledgeMastery: () => request('/knowledge/mastery'),

  getHeatmap: () => request('/knowledge/heatmap'),

  getContent: (kpId: string) => request(`/learn/content/${kpId}`),

  submitAnswer: (data: { knowledgePointId: string; questionId: string; optionIndex: number; attemptCount: number }) =>
    request('/learn/answer', { method: 'POST', body: JSON.stringify(data) }),

  submitWrong: (data: { knowledgePointId: string; questionId: string; errorReason: string; attemptCount: number }) =>
    request('/learn/wrong', { method: 'POST', body: JSON.stringify(data) }),

  completeLearning: (knowledgePointId: string) =>
    request('/learn/complete', { method: 'POST', body: JSON.stringify({ knowledgePointId }) }),

  getReviewToday: () => request('/review/today'),

  reviewCheckin: (wrongQuestionId: string, isCorrect: boolean) =>
    request('/review/checkin', { method: 'POST', body: JSON.stringify({ wrongQuestionId, isCorrect }) }),

  getReviewAll: () => request('/review/all'),
};

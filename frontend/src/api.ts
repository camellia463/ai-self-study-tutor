const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // 双保险：部分云环境的反向代理会改写 Authorization 头，
    // 自定义头通常不受影响，后端会依次尝试两者
    headers['X-Auth-Token'] = token;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    // 后端未启动 / 网络错误
    throw new Error('无法连接服务器，请确认后端已启动');
  }

  if (res.status === 401) {
    clearAuth();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('登录已过期，请重新登录');
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

  me: () => request('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),

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

  getFeynman: (kpId: string) => request(`/learn/feynman/${kpId}`),

  submitFeynman: (knowledgePointId: string, answer: string) =>
    request('/learn/feynman/submit', { method: 'POST', body: JSON.stringify({ knowledgePointId, answer }) }),

  getScorePrediction: () => request('/score/prediction'),

  getReviewToday: () => request('/review/today'),

  reviewCheckin: (wrongQuestionId: string, isCorrect: boolean) =>
    request('/review/checkin', { method: 'POST', body: JSON.stringify({ wrongQuestionId, isCorrect }) }),

  getReviewAll: () => request('/review/all'),

  // 成长档案「知识档案柜」
  getGrowthToday: () => request('/growth/today'),
  saveReflection: (reflection: string) =>
    request('/growth/reflection', { method: 'POST', body: JSON.stringify({ reflection }) }),
  getGrowthTrend: (days = 30) => request(`/growth/trend?days=${days}`),

  // 定时提醒
  getReminders: () => request('/growth/reminders'),
  saveReminders: (r: { reviewTime: string; studyStartEnabled: boolean; studyStartTime: string; breakEnabled: boolean; breakIntervalMinutes: number }) =>
    request('/growth/reminders', { method: 'POST', body: JSON.stringify(r) }),
};

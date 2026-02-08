export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';

export type ApiError = { error: string; details?: any };

export function getToken(): string | null {
  return localStorage.getItem('mt_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('mt_token', token);
  else localStorage.removeItem('mt_token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw data as ApiError;
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean; db: boolean }>('/health'),
  register: (payload: { email: string; password: string; fullName: string; role?: 'USER'|'PROVIDER' }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<any>('/me'),
  providersPending: () => request<any[]>('/providers/admin/pending'),
  verifyProvider: (providerId: string, payload: { verified: boolean; note?: string }) =>
    request<any>(`/providers/admin/${providerId}/verify`, { method: 'POST', body: JSON.stringify(payload) }),
  providerProfileUpdate: (payload: any) => request<any>('/providers/me', { method: 'PUT', body: JSON.stringify(payload) }),
  proceduresMe: () => request<any[]>('/procedures/me'),
  procedureUpsert: (payload: any) => request<any>('/procedures/me', { method: 'POST', body: JSON.stringify(payload) }),
  createQuotation: (payload: { providerId: string; procedureId: string; notes?: string; slaHours?: number }) =>
    request<any>('/quotations', { method: 'POST', body: JSON.stringify(payload) }),
  quotationsMe: () => request<any[]>('/quotations/me'),
  quotationMessages: (id: string) => request<any[]>(`/quotations/${id}/messages`),
  sendQuotationMessage: (id: string, body: string) =>
    request<any>(`/quotations/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
  uploadQuotationAttachments: async (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return request<any>(`/quotations/${id}/attachments`, { method: 'POST', body: form });
  },
  notificationsMe: () => request<any[]>('/notifications/me'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  createDeposit: (payload: { quotationId?: string; amountCents: number; currency?: string; holdDays?: number }) =>
    request<any>('/payments/deposit', { method: 'POST', body: JSON.stringify(payload) }),
  // Provider verification docs
  providerVerificationDocsMe: () => request<any[]>('/providers/verification-docs/me'),
  uploadProviderVerificationDoc: async (docType: string, file: File) => {
    const form = new FormData();
    form.append('docType', docType);
    form.append('file', file);
    return request<any>('/providers/verification-docs', { method: 'POST', body: form });
  },

  // Admin verification docs review
  adminVerificationDocs: (status?: string) => request<any[]>(`/providers/admin/verification-docs${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  adminReviewVerificationDoc: (docId: string, payload: { decision: 'APPROVE'|'REJECT'; note?: string }) =>
    request<any>(`/providers/admin/verification-docs/${docId}/review`, { method: 'POST', body: JSON.stringify(payload) }),
  adminAuditLogs: (take?: number) => request<any[]>(`/providers/admin/audit-logs${take ? `?take=${take}` : ''}`),

  // Payouts
  adminPayouts: (status?: string) => request<any[]>(`/payments/admin/payouts${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  providerPayouts: () => request<any[]>('/payments/provider/payouts'),

  // Stripe Connect onboarding
  stripeConnectCreateAccount: () => request<any>('/payments/stripe/connect/account', { method: 'POST' }),
  stripeConnectOnboardingLink: () => request<any>('/payments/stripe/connect/account-link', { method: 'POST' }),
  stripeConnectStatus: () => request<any>('/payments/stripe/connect/status'),

  paymentsMe: () => request<any[]>('/payments/me')
};

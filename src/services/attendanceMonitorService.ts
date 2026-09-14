import { apiRequest } from './apiClient';

export interface QrMonitorState {
  pairingKey: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  activatedAt: string | null;
  activatedBy: string | null;
}

export async function createMonitorKey(): Promise<QrMonitorState> {
  return apiRequest<QrMonitorState>('/api/attendance/qr/monitor/key', { method: 'POST' });
}

export async function getMonitorState(): Promise<QrMonitorState | null> {
  try {
    return await apiRequest<QrMonitorState>('/api/attendance/qr/monitor');
  } catch {
    return null;
  }
}

export async function activateMonitor(enteredKey: string, activatedBy: string): Promise<QrMonitorState> {
  return apiRequest<QrMonitorState>('/api/attendance/qr/monitor/activate', {
    method: 'POST',
    body: { pairingKey: enteredKey, activatedBy },
  });
}

export async function deactivateMonitor(): Promise<void> {
  await apiRequest<void>('/api/attendance/qr/monitor', { method: 'DELETE' });
}

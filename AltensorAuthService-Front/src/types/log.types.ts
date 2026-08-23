export interface HttpLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status: number;
  durationMs: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

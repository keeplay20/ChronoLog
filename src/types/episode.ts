export type Severity = 'CRITICAL' | 'ROUTINE' | 'INFO' | 'WARNING' | 'ELEVATED';
export type EventType = 'VITALS_STREAM' | 'CLINICAL_NOTE' | 'SYSTEM_ALERT';

export interface VitalsMetrics {
  heartRate: (number | null)[];
  spo2: number | null;
  respiratoryRate: number;
}

export interface MediaPayload {
  type: 'VOICE_MEMO';
  durationSeconds: number;
  transcriptPreview: string;
}

export interface SystemPayload {
  errorCode: string;
  deviceType: string;
  batteryLevel: number;
}

export interface Episode {
  id: string;
  eventType: EventType;
  timestamp: string;
  patientName: string;
  severity: Severity;
  metrics: VitalsMetrics | null;
  media?: MediaPayload;
  systemPayload?: SystemPayload;
  hasNotes: boolean;
  summaryText: string | null;
}

export interface DeviceIntegrityResult {
  isSecure: boolean;
  platform: 'ios' | 'android';
  reasons: string[];
}

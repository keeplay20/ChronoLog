export const colors = {
  bg: '#0A0E17',
  surface: '#121826',
  surfaceElevated: '#1A2235',
  border: '#2A3548',
  textPrimary: '#E8ECF4',
  textSecondary: '#8B95A8',
  textMuted: '#5C6578',
  accent: '#3B82F6',
  accentGlow: 'rgba(59, 130, 246, 0.35)',
  critical: '#EF4444',
  criticalGlow: 'rgba(239, 68, 68, 0.45)',
  warning: '#F59E0B',
  elevated: '#F97316',
  routine: '#22C55E',
  info: '#6366F1',
  sparkline: '#EF4444',
  sparklineGap: '#4B5563',
  pulse: '#FCA5A5',
};

export const severityColors: Record<string, string> = {
  CRITICAL: colors.critical,
  ROUTINE: colors.routine,
  INFO: colors.info,
  WARNING: colors.warning,
  ELEVATED: colors.elevated,
};

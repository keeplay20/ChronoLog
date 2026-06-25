import React, {useCallback} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import type {Episode} from '../types/episode';
import {colors, severityColors} from '../theme/colors';
import {formatDuration, formatTimestamp} from '../utils/episodeLayout';
import {Sparkline} from './Sparkline';
import {PulsingIndicator} from './PulsingIndicator';

interface EpisodeCardProps {
  episode: Episode;
  onPress: (episode: Episode) => void;
}

function EpisodeCardComponent({episode, onPress}: EpisodeCardProps) {
  const handlePress = useCallback(() => onPress(episode), [episode, onPress]);
  const accent = severityColors[episode.severity] ?? colors.accent;

  return (
    <Pressable
      onPress={handlePress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accentBar, {backgroundColor: accent}]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {episode.severity === 'CRITICAL' && (
              <PulsingIndicator color={accent} size={8} />
            )}
            <Text style={styles.patient} numberOfLines={1}>
              {episode.patientName}
            </Text>
          </View>
          <View style={[styles.badge, {borderColor: accent}]}>
            <Text style={[styles.badgeText, {color: accent}]}>
              {episode.severity}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {episode.eventType.replace('_', ' ')} · {formatTimestamp(episode.timestamp)}
        </Text>

        {episode.eventType === 'VITALS_STREAM' && episode.metrics && (
          <View style={styles.vitalsBlock}>
            {episode.severity === 'CRITICAL' ? (
              <>
                <Sparkline data={episode.metrics.heartRate} width={300} height={44} />
                <View style={styles.metricsRow}>
                  <Metric label="HR" value={lastValid(episode.metrics.heartRate)} unit="bpm" />
                  <Metric
                    label="SpO₂"
                    value={episode.metrics.spo2}
                    unit="%"
                    alert={episode.metrics.spo2 !== null && episode.metrics.spo2 < 92}
                  />
                  <Metric label="RR" value={episode.metrics.respiratoryRate} unit="/min" />
                </View>
              </>
            ) : (
              <View style={styles.compactMetrics}>
                <Metric label="HR" value={lastValid(episode.metrics.heartRate)} unit="bpm" compact />
                <Metric label="SpO₂" value={episode.metrics.spo2} unit="%" compact />
                <Metric label="RR" value={episode.metrics.respiratoryRate} unit="/min" compact />
              </View>
            )}
          </View>
        )}

        {episode.eventType === 'CLINICAL_NOTE' && episode.media && (
          <View style={styles.audioRow}>
            <View style={styles.playIcon}>
              <Text style={styles.playGlyph}>▶</Text>
            </View>
            <View style={styles.audioText}>
              <Text style={styles.audioDuration}>
                Voice memo · {formatDuration(episode.media.durationSeconds)}
              </Text>
              <Text style={styles.transcript} numberOfLines={2}>
                {episode.media.transcriptPreview}
              </Text>
            </View>
          </View>
        )}

        {episode.eventType === 'SYSTEM_ALERT' && episode.systemPayload && (
          <View style={styles.systemRow}>
            <Text style={styles.systemCode}>{episode.systemPayload.errorCode}</Text>
            <Text style={styles.systemDevice}>{episode.systemPayload.deviceType}</Text>
            <Text style={styles.systemBattery}>
              🔋 {episode.systemPayload.batteryLevel}%
            </Text>
          </View>
        )}

        {episode.hasNotes && episode.summaryText ? (
          <Text style={styles.summary} numberOfLines={2}>
            {episode.summaryText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function lastValid(arr: (number | null)[]): number | string {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) {
      return arr[i] as number;
    }
  }
  return '—';
}

function Metric({
  label,
  value,
  unit,
  alert,
  compact,
}: {
  label: string;
  value: number | string | null;
  unit: string;
  alert?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={compact ? styles.metricCompact : styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, alert && styles.metricAlert]}>
        {value ?? '—'}
        <Text style={styles.metricUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

function propsAreEqual(prev: EpisodeCardProps, next: EpisodeCardProps) {
  return prev.episode === next.episode && prev.onPress === next.onPress;
}

export const EpisodeCard = React.memo(EpisodeCardComponent, propsAreEqual);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.995}],
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  patient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  vitalsBlock: {
    gap: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    alignItems: 'flex-start',
  },
  metricCompact: {},
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricAlert: {
    color: colors.critical,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  audioRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: colors.accent,
    fontSize: 14,
    marginLeft: 2,
  },
  audioText: {
    flex: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  transcript: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  systemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  systemCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: colors.warning,
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  systemDevice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  systemBattery: {
    fontSize: 12,
    color: colors.critical,
  },
  summary: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

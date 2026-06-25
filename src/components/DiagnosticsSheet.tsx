import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type {Episode} from '../types/episode';
import {colors, severityColors} from '../theme/colors';
import {Sparkline} from './Sparkline';

const {height: SCREEN_H} = Dimensions.get('window');
const SNAP_EXPANDED = SCREEN_H * 0.22;
const SNAP_COLLAPSED = SCREEN_H * 0.72;
const RUBBER = 0.35;

interface DiagnosticsSheetProps {
  episode: Episode;
}

function DiagnosticsSheetComponent({episode}: DiagnosticsSheetProps) {
  const translateY = useSharedValue(SNAP_COLLAPSED);
  const contextY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate(e => {
      let next = contextY.value + e.translationY;
      if (next < SNAP_EXPANDED) {
        next = SNAP_EXPANDED - (SNAP_EXPANDED - next) * RUBBER;
      }
      if (next > SNAP_COLLAPSED + 80) {
        next = SNAP_COLLAPSED + 80 + (next - SNAP_COLLAPSED - 80) * RUBBER;
      }
      translateY.value = next;
    })
    .onEnd(e => {
      const flickUp = e.velocityY < -800;
      const flickDown = e.velocityY > 900;
      const mid = (SNAP_EXPANDED + SNAP_COLLAPSED) / 2;

      if (flickUp) {
        translateY.value = withSpring(SNAP_EXPANDED, {damping: 22, stiffness: 220});
      } else if (flickDown) {
        translateY.value = withSpring(SNAP_COLLAPSED, {damping: 24, stiffness: 200});
      } else {
        translateY.value = withSpring(
          translateY.value < mid ? SNAP_EXPANDED : SNAP_COLLAPSED,
          {damping: 22, stiffness: 210},
        );
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_EXPANDED, SNAP_COLLAPSED],
      [0.45, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const accent = severityColors[episode.severity] ?? colors.accent;

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <Text style={styles.title}>Diagnostics</Text>
          <Text style={styles.subtitle}>Episode {episode.id}</Text>

          <View style={[styles.statusPill, {borderColor: accent}]}>
            <Text style={[styles.statusText, {color: accent}]}>
              {episode.severity} · {episode.eventType.replace(/_/g, ' ')}
            </Text>
          </View>

          {episode.metrics?.heartRate && episode.severity === 'CRITICAL' && (
            <View style={styles.chartBlock}>
              <Text style={styles.chartLabel}>Heart rate trend</Text>
              <Sparkline data={episode.metrics.heartRate} width={340} height={64} />
            </View>
          )}

          <View style={styles.grid}>
            <DiagCell label="Patient" value={episode.patientName} />
            <DiagCell label="Timestamp" value={new Date(episode.timestamp).toLocaleString()} />
            {episode.metrics && (
              <>
                <DiagCell label="SpO₂" value={`${episode.metrics.spo2 ?? 'N/A'}%`} />
                <DiagCell label="Resp. Rate" value={`${episode.metrics.respiratoryRate}/min`} />
              </>
            )}
            {episode.systemPayload && (
              <>
                <DiagCell label="Error" value={episode.systemPayload.errorCode} />
                <DiagCell label="Device" value={episode.systemPayload.deviceType} />
                <DiagCell label="Battery" value={`${episode.systemPayload.batteryLevel}%`} />
              </>
            )}
          </View>

          {episode.summaryText ? (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>Clinical notes</Text>
              <Text style={styles.notesBody}>{episode.summaryText}</Text>
            </View>
          ) : null}

          <Text style={styles.hint}>Drag ↑ to expand · Flick ↓ to collapse</Text>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

function DiagCell({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

export const DiagnosticsSheet = React.memo(DiagnosticsSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_H,
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
    fontFamily: 'Menlo',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chartBlock: {
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  cell: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notesBlock: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  notesBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
});

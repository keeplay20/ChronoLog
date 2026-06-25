import React, {useEffect} from 'react';
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Episode} from '../types/episode';
import {colors, severityColors} from '../theme/colors';
import {formatTimestamp} from '../utils/episodeLayout';
import {DiagnosticsSheet} from './DiagnosticsSheet';
import {Sparkline} from './Sparkline';
import {PulsingIndicator} from './PulsingIndicator';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

export interface CardLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EpisodeDetailOverlayProps {
  episode: Episode;
  layout: CardLayout;
  onClose: () => void;
}

function EpisodeDetailOverlayComponent({
  episode,
  layout,
  onClose,
}: EpisodeDetailOverlayProps) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const accent = severityColors[episode.severity] ?? colors.accent;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 420,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [progress]);

  const close = () => {
    progress.value = withTiming(0, {duration: 320}, finished => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const morphStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      position: 'absolute',
      left: layout.x + (0 - layout.x) * p,
      top: layout.y + (0 - layout.y) * p,
      width: layout.width + (SCREEN_W - layout.width) * p,
      height: layout.height + (SCREEN_H - layout.height) * p,
      borderRadius: 14 * (1 - p),
      opacity: 0.25 + p * 0.75,
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{translateY: (1 - progress.value) * 24}],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[
          styles.morphShell,
          {backgroundColor: colors.surface, borderColor: accent},
          morphStyle,
        ]}
      />

      <Animated.View style={[styles.detailContent, contentStyle]}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
          <Pressable onPress={close} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.topTitle}>Episode Detail</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {episode.severity === 'CRITICAL' && (
              <PulsingIndicator color={accent} size={12} />
            )}
            <Text style={styles.heroPatient}>{episode.patientName}</Text>
          </View>
          <Text style={styles.heroMeta}>
            {episode.eventType.replace(/_/g, ' ')} · {formatTimestamp(episode.timestamp)}
          </Text>
          <View style={[styles.severityBanner, {backgroundColor: accent + '22', borderColor: accent}]}>
            <Text style={[styles.severityBannerText, {color: accent}]}>
              {episode.severity}
            </Text>
          </View>

          {episode.metrics?.heartRate && episode.severity === 'CRITICAL' && (
            <View style={styles.heroChart}>
              <Sparkline data={episode.metrics.heartRate} width={SCREEN_W - 48} height={80} />
            </View>
          )}

          {episode.summaryText && (
            <Text style={styles.heroSummary}>{episode.summaryText}</Text>
          )}
        </View>

        <DiagnosticsSheet episode={episode} />
      </Animated.View>
    </View>
  );
}

export const EpisodeDetailOverlay = React.memo(EpisodeDetailOverlayComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1,
  },
  morphShell: {
    zIndex: 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailContent: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 72,
  },
  backText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  topTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  heroPatient: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityBanner: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  severityBannerText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  heroChart: {
    marginBottom: 16,
  },
  heroSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});

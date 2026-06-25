import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  type View as ViewType,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import episodesData from '../data/episodes.json';
import type {Episode} from '../types/episode';
import {colors} from '../theme/colors';
import {estimateEpisodeHeight} from '../utils/episodeLayout';
import {EpisodeCard} from './EpisodeCard';
import {
  EpisodeDetailOverlay,
  type CardLayout,
} from './EpisodeDetailOverlay';

const EPISODES = episodesData as Episode[];

interface SelectedEpisode {
  episode: Episode;
  layout: CardLayout;
}

function TelemetryFeedComponent() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashList<Episode>>(null);
  const cardRefs = useRef<Map<string, ViewType>>(new Map());
  const [selected, setSelected] = useState<SelectedEpisode | null>(null);

  const onPressEpisode = useCallback((episode: Episode) => {
    const ref = cardRefs.current.get(episode.id);
    if (ref && 'measureInWindow' in ref) {
      ref.measureInWindow((x, y, width, height) => {
        setSelected({episode, layout: {x, y, width, height}});
      });
    } else {
      setSelected({
        episode,
        layout: {x: 16, y: 120, width: 360, height: 140},
      });
    }
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Episode}) => (
      <View
        ref={r => {
          if (r) {
            cardRefs.current.set(item.id, r);
          }
        }}
        collapsable={false}>
        <EpisodeCard episode={item} onPress={onPressEpisode} />
      </View>
    ),
    [onPressEpisode],
  );

  const keyExtractor = useCallback((item: Episode) => item.id, []);

  const overrideItemLayout = useCallback(
    (layout: {size?: number; span?: number}, item: Episode) => {
      layout.size = estimateEpisodeHeight(item) + 12;
    },
    [],
  );

  const getItemType = useCallback((item: Episode) => {
    return `${item.eventType}-${item.severity}-${item.hasNotes}`;
  }, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.brand}>ChronoLog</Text>
        <Text style={styles.tagline}>Episodic Performance Dashboard</Text>
        <Text style={styles.count}>{EPISODES.length.toLocaleString()} episodes</Text>
      </View>
    ),
    [],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <FlashList
          ref={listRef}
          data={EPISODES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={156}
          overrideItemLayout={overrideItemLayout}
          getItemType={getItemType}
          drawDistance={600}
          removeClippedSubviews
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
        />
      </View>
      {selected && (
        <EpisodeDetailOverlay
          episode={selected.episode}
          layout={selected.layout}
          onClose={() => setSelected(null)}
        />
      )}
    </GestureHandlerRootView>
  );
}

export const TelemetryFeed = React.memo(TelemetryFeedComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  count: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
});

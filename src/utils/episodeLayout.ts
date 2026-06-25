import type {Episode} from '../types/episode';

/** Precomputed card heights for FlashList overrideItemLayout — avoids layout thrash. */
export function estimateEpisodeHeight(episode: Episode): number {
  const base = 88;
  const notes = episode.hasNotes && episode.summaryText ? 52 : 0;

  if (episode.eventType === 'VITALS_STREAM') {
    if (episode.severity === 'CRITICAL') {
      return base + 72 + notes; // sparkline + metrics row
    }
    if (episode.severity === 'ROUTINE') {
      return base + 36 + notes; // compact metrics only
    }
    return base + 48 + notes;
  }

  if (episode.eventType === 'CLINICAL_NOTE') {
    return base + 64 + notes;
  }

  if (episode.eventType === 'SYSTEM_ALERT') {
    return base + 56 + notes;
  }

  return base + notes;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

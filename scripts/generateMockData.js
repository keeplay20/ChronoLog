/**
 * Generates 2000+ episodic medical telemetry records for ChronoLog.
 * Run: node scripts/generateMockData.js
 */

const fs = require('fs');
const path = require('path');

const PATIENTS = [
  'Patient Alpha',
  'Patient Beta',
  'Patient Gamma',
  'Patient Delta',
  'Patient Epsilon',
  'Patient Zeta',
  'Patient Eta',
  'Patient Theta',
  'Bed 4 - Telemetry Hub',
  'Bed 7 - ICU Ward',
  'Bed 12 - Recovery',
];

const SEVERITIES = ['CRITICAL', 'ROUTINE', 'INFO', 'WARNING', 'ELEVATED'];
const EVENT_TYPES = ['VITALS_STREAM', 'CLINICAL_NOTE', 'SYSTEM_ALERT'];

const ERROR_CODES = [
  'ERR_BT_DISCONNECT',
  'ERR_SENSOR_DRIFT',
  'ERR_HUB_TIMEOUT',
  'ERR_CALIBRATION',
  'ERR_FIRMWARE',
];

const DEVICE_TYPES = [
  'WEARABLE_MONITOR',
  'BEDside_HUB',
  'INFUSION_PUMP',
  'ECG_PATCH',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function generateHeartRate(severity, withNulls) {
  const base =
    severity === 'CRITICAL'
      ? randomInt(110, 160)
      : severity === 'ELEVATED'
        ? randomInt(85, 105)
        : randomInt(60, 80);
  const len = randomInt(5, 12);
  const arr = [];
  for (let i = 0; i < len; i++) {
    if (withNulls && Math.random() < 0.15) {
      arr.push(null);
    } else {
      arr.push(base + randomInt(-12, 12));
    }
  }
  return arr;
}

function generateEpisode(index) {
  const severity = pick(SEVERITIES);
  const eventType =
    severity === 'INFO' && Math.random() > 0.4
      ? 'CLINICAL_NOTE'
      : severity === 'WARNING' && Math.random() > 0.5
        ? 'SYSTEM_ALERT'
        : pick(EVENT_TYPES.filter(t => t !== 'CLINICAL_NOTE' || severity === 'INFO'));

  const hoursAgo = index * 0.02 + randomInt(0, 3);
  const ts = new Date(Date.now() - hoursAgo * 3600000).toISOString();
  const patientName = pick(PATIENTS);
  const hasNotes = Math.random() > 0.35;

  const base = {
    id: `ep-${String(index).padStart(5, '0')}-${severity.slice(0, 4).toLowerCase()}`,
    eventType,
    timestamp: ts,
    patientName,
    severity,
    hasNotes,
    summaryText: null,
    metrics: null,
    media: undefined,
    systemPayload: undefined,
  };

  if (eventType === 'VITALS_STREAM') {
    const withNulls = severity === 'ELEVATED' || Math.random() < 0.08;
    base.metrics = {
      heartRate: generateHeartRate(severity, withNulls),
      spo2:
        withNulls && Math.random() < 0.3
          ? null
          : severity === 'CRITICAL'
            ? randomInt(82, 92)
            : randomInt(94, 100),
      respiratoryRate: randomInt(12, 28),
    };
    if (hasNotes) {
      const notes = [
        'Acute tachycardic episode recorded during active observation. Desaturation noted.',
        'Stable vitals within expected range for post-operative monitoring.',
        'Sensor artifact detected. Partial data loss during movement.',
        'Transient spike correlates with ambulation event.',
        'Baseline drift corrected after sensor repositioning.',
      ];
      base.summaryText = pick(notes);
    }
  } else if (eventType === 'CLINICAL_NOTE') {
    base.media = {
      type: 'VOICE_MEMO',
      durationSeconds: randomInt(45, 240),
      transcriptPreview: pick([
        'Patient reports mild discomfort in the lower left quadrant...',
        'Morning rounds note: appetite improving, pain 3/10...',
        'Family conference summary documented for care plan review...',
        'Medication reconciliation completed with pharmacy...',
      ]),
    };
    base.summaryText = pick([
      'Audio dictated by Dr. S. Rao during morning rounds.',
      'Nursing shift handoff voice memo.',
      'Consultation summary recorded at bedside.',
    ]);
  } else if (eventType === 'SYSTEM_ALERT') {
    base.systemPayload = {
      errorCode: pick(ERROR_CODES),
      deviceType: pick(DEVICE_TYPES),
      batteryLevel: randomInt(5, 45),
    };
    base.summaryText = pick([
      'Wearable sensor connectivity lost. Battery critical.',
      'Hub communication timeout — retry scheduled.',
      'Firmware update pending for bedside monitor.',
      'Calibration drift detected on infusion channel.',
    ]);
  }

  return base;
}

const COUNT = 2200;
const episodes = [];
for (let i = 0; i < COUNT; i++) {
  episodes.push(generateEpisode(i + 101));
}

// Ensure sample schema items from spec are present at top
const samples = [
  {
    id: 'ep-101-crit',
    eventType: 'VITALS_STREAM',
    timestamp: '2026-06-25T08:30:00Z',
    patientName: 'Patient Alpha',
    severity: 'CRITICAL',
    metrics: {
      heartRate: [72, 75, 82, 110, 145, 130, 95, 140, 155],
      spo2: 88,
      respiratoryRate: 24,
    },
    hasNotes: true,
    summaryText:
      'Acute tachycardic episode recorded during active observation. Desaturation noted. Immediate intervention required.',
  },
  {
    id: 'ep-102-rout',
    eventType: 'VITALS_STREAM',
    timestamp: '2026-06-25T08:15:00Z',
    patientName: 'Patient Beta',
    severity: 'ROUTINE',
    metrics: {
      heartRate: [68, 70, 69, 72, 71],
      spo2: 98,
      respiratoryRate: 14,
    },
    hasNotes: false,
    summaryText: null,
  },
];

episodes.unshift(...samples.reverse());

const outPath = path.join(__dirname, '../src/data/episodes.json');
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, JSON.stringify(episodes));
console.log(`Generated ${episodes.length} episodes → ${outPath}`);

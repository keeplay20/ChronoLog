import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../theme/colors';

interface SecurityWarningModalProps {
  visible: boolean;
  reasons: string[];
  onAcknowledge: () => void;
}

function SecurityWarningModalComponent({
  visible,
  reasons,
  onAcknowledge,
}: SecurityWarningModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>⚠</Text>
          </View>
          <Text style={styles.title}>
            {Platform.OS === 'ios' ? 'Device Integrity Alert' : 'Security Warning'}
          </Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'ios'
              ? 'This device may be jailbroken or running in an insecure environment. Protected health telemetry should not be accessed on compromised devices.'
              : 'This device appears to be rooted or running on an emulator. Clinical data access is restricted on untrusted environments.'}
          </Text>
          {reasons.length > 0 && (
            <View style={styles.reasonBox}>
              {reasons.map(r => (
                <Text key={r} style={styles.reason}>
                  • {r}
                </Text>
              ))}
            </View>
          )}
          <Pressable
            style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onAcknowledge}>
            <Text style={styles.buttonText}>I Understand — Continue at My Risk</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const SecurityWarningModal = React.memo(SecurityWarningModalComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Platform.OS === 'ios' ? '#1C1C1E' : colors.surfaceElevated,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 40,
    color: colors.warning,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  reasonBox: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  reason: {
    fontSize: 12,
    color: colors.critical,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

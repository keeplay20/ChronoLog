/**
 * ChronoLog – Episodic Performance Dashboard
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SecurityWarningModal} from './src/components/SecurityWarningModal';
import {checkDeviceIntegrity} from './src/native/DeviceIntegrity';
import {TelemetryFeed} from './src/screens/TelemetryFeed';
import {colors} from './src/theme/colors';

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [integrityBlocked, setIntegrityBlocked] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    checkDeviceIntegrity()
      .then(result => {
        if (!result.isSecure) {
          setIntegrityBlocked(true);
          setReasons(result.reasons);
        }
      })
      .catch(error => {
        console.error(error);

        setIntegrityBlocked(true);

        setReasons(['Unable to verify device integrity']);
      })
      .finally(() => setLoading(false));
  }, []);

  const onAcknowledge = useCallback(() => setAcknowledged(true), []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const showWarning = integrityBlocked && !acknowledged;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        {!showWarning && <TelemetryFeed />}
        <SecurityWarningModal
          visible={showWarning}
          reasons={reasons}
          onAcknowledge={onAcknowledge}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;

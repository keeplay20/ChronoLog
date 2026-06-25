import React, {useEffect} from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {StyleSheet, View} from 'react-native';
import {colors} from '../theme/colors';

interface PulsingIndicatorProps {
  color?: string;
  size?: number;
}

function PulsingIndicatorComponent({
  color = colors.critical,
  size = 10,
}: PulsingIndicatorProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, {duration: 600, easing: Easing.out(Easing.ease)}),
        withTiming(1, {duration: 600, easing: Easing.in(Easing.ease)}),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, {duration: 600}),
        withTiming(1, {duration: 600}),
      ),
      -1,
      false,
    );
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, {width: size * 2.2, height: size * 2.2}]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            borderColor: color,
          },
          ringStyle,
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export const PulsingIndicator = React.memo(PulsingIndicatorComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  core: {
    shadowColor: colors.critical,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

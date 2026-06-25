import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Line, Path} from 'react-native-svg';
import {colors} from '../theme/colors';

interface SparklineProps {
  data: (number | null)[];
  width?: number;
  height?: number;
  stroke?: string;
}

function buildSparklinePath(
  data: (number | null)[],
  width: number,
  height: number,
): {path: string; gaps: {x: number; y: number}[]} {
  const valid = data.filter((v): v is number => v !== null);
  if (valid.length === 0) {
    return {path: '', gaps: []};
  }

  const min = Math.min(...valid) - 5;
  const max = Math.max(...valid) + 5;
  const range = max - min || 1;
  const stepX = width / Math.max(data.length - 1, 1);

  const gaps: {x: number; y: number}[] = [];
  let path = '';
  let penDown = false;

  data.forEach((value, i) => {
    const x = i * stepX;
    if (value === null) {
      penDown = false;
      gaps.push({x, y: height / 2});
      return;
    }
    const y = height - ((value - min) / range) * (height - 8) - 4;
    path += penDown ? ` L ${x} ${y}` : `M ${x} ${y}`;
    penDown = true;
  });

  return {path, gaps};
}

function SparklineComponent({
  data,
  width = 280,
  height = 48,
  stroke = colors.sparkline,
}: SparklineProps) {
  const {path, gaps} = useMemo(
    () => buildSparklinePath(data, width, height),
    [data, width, height],
  );

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height}>
        {path ? (
          <Path
            d={path}
            stroke={stroke}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {gaps.map((g, i) => (
          <Line
            key={i}
            x1={g.x}
            y1={g.y - 6}
            x2={g.x}
            y2={g.y + 6}
            stroke={colors.sparklineGap}
            strokeWidth={2}
            strokeDasharray="2 3"
          />
        ))}
        {gaps.map((g, i) => (
          <Circle
            key={`c-${i}`}
            cx={g.x}
            cy={g.y}
            r={2}
            fill={colors.sparklineGap}
          />
        ))}
      </Svg>
    </View>
  );
}

export const Sparkline = React.memo(SparklineComponent);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});

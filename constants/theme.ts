/**
 * Fuel Credit — light business theme
 */

import { Platform } from 'react-native';

export const FuelColors = {
  primary: '#4F46E5', // Indigo 600
  primaryMuted: '#EEF2FF', // Indigo 50
  background: '#F1F5F9', // Slate 100
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',
  success: '#10B981',
  successMuted: '#ECFDF5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerMuted: '#FEF2F2',
  hsd: '#0891B2', // Cyan 600
  ms: '#9333EA', // Purple 600
  chipBg: '#F1F5F9',
};

const tintColorLight = FuelColors.primary;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: FuelColors.text,
    background: FuelColors.background,
    tint: tintColorLight,
    icon: FuelColors.textSecondary,
    tabIconDefault: FuelColors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

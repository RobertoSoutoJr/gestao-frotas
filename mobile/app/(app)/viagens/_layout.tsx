import { Stack } from 'expo-router';
import { colors } from '../../../src/lib/theme';

export default function ViagensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}

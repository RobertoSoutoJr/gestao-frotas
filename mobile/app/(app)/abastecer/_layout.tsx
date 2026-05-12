import { Stack } from 'expo-router';
import { colors } from '../../../src/lib/theme';

export default function AbastecerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}

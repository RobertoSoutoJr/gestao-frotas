import { Stack } from 'expo-router';
import { useColors } from '../../../src/contexts/ThemeContext';

export default function MotoristasLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}

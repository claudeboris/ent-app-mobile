import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="administration" options={{ headerShown: false }} />
      <Stack.Screen name="establishment_details" options={{ headerShown: false }} />
    </Stack>
  );
}
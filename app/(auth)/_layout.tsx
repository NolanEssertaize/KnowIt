/**
 * @file _layout.tsx
 * @description Auth group layout (Expo Router)
 * 
 * This layout wraps all auth screens (login, register)
 * and provides shared configuration.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}

import { Tabs } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/hooks/constants/theme';
import { getSession, subscribeSession } from '@/lib/auth';

export default function TabLayout() {
  const [session, setSessionState] = useState(getSession());

  useEffect(() => {
    return subscribeSession(() => {
      setSessionState(getSession());
    });
  }, []);

  const isAdmin = session.role === 'admin';
  const isLoggedUser = session.role === 'user';
  const scheme = 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[scheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
      initialRouteName="Login">
  
      <Tabs.Screen
        name="Login"
        options={{
          title: 'Pieslēgties',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mājas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          href: isLoggedUser ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admins',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.badge.checkmark" color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}

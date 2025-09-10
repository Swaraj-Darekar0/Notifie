// App.js - Complete integration with notifications
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, AppState, TouchableOpacity, Text } from 'react-native';

// Your existing screens
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import AllTasksScreen from './src/screens/AllTasksScreen';

// New notification-related screens and services
import PermissionsScreen from './src/screens/PermissionsScreen';
import NotificationService from './src/services/NotificationService';
import PermissionsManager from './src/services/PermissionsManager';

// Your existing theme
import { theme } from './src/styles/theme';

const Stack = createStackNavigator();

// Nothing OS navigation theme (matches your existing theme structure)
const NothingNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accent,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.accent,
  },
};

const App = () => {
  useEffect(() => {
    initializeApp();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground, refresh notifications
        refreshNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize the notification service
      NotificationService.init();

      // Check if permissions are granted, then enable notifications
      const hasPermission = await PermissionsManager.checkNotificationPermission();
      if (hasPermission) {
        NotificationService.toggleNotifications(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      // Only refresh if notifications are currently enabled
      if (NotificationService.isNotificationsEnabled()) {
        await NotificationService.updateTodayTasksNotification();
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  // Permissions button component for header
  const PermissionsButton = ({ navigation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Permissions')}
      style={{ marginRight: 15 }}
    >
      <Text style={{
        fontFamily: theme.typography.fontFamily.mono,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.accent,
      }}>
        ●●●
      </Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer theme={NothingNavigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: theme.layout.borderWidth,
            borderBottomColor: theme.colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.mono,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.text,
            textTransform: 'uppercase',
            fontWeight: theme.typography.fontWeight.bold,
          },
          headerTintColor: theme.colors.text,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerRight: () => <PermissionsButton navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{ title: 'NEW TASK' }}
        />
        <Stack.Screen
          name="AllTasks"
          component={AllTasksScreen}
          options={{ title: 'ALL TASKS' }}
        />
        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={{ title: 'PERMISSIONS' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
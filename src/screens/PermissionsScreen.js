// src/screens/PermissionsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { theme, nothingStyles } from '../styles/theme';
import NothingButton from '../components/NothingButton';
import PermissionsManager from '../services/PermissionsManager';
import NotificationService from '../services/NotificationService';
import NothingAlert, { NothingAlerts } from '../components/NothingAlert';

const PermissionsScreen = ({ navigation }) => {
  const [permissionStatus, setPermissionStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [alertProps, setAlertProps] = useState(null);

  useEffect(() => {
    loadPermissionStatus();
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    const active = NotificationService.isNotificationsEnabled();
    setNotificationsActive(active);
  };

  const loadPermissionStatus = async () => {
    try {
      const status = await PermissionsManager.getPermissionStatusForUI();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error loading permission status:', error);
    }
  };

  const handlePermissionRequest = async (permissionType) => {
    setLoading(true);
    try {
      const granted = await PermissionsManager.handlePermissionRequest(
        permissionType,
        (alertOptions) => setAlertProps(alertOptions)
      );

      if (granted) {
        await loadPermissionStatus();
        setAlertProps(NothingAlerts.success('NOTIFICATIONS ENABLED', 'Your tasks will now appear in the notification panel.'));
      }
    } catch (error) {
      console.error('Error handling permission request:', error);
      setAlertProps(NothingAlerts.error('ERROR', 'Something went wrong while requesting permissions.'));
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await NotificationService.showTodayTasksNotification();
      setAlertProps(NothingAlerts.success('TEST SENT', 'Check your notification panel for the task display.'));
    } catch (error) {
      setAlertProps(NothingAlerts.error('TEST FAILED', 'Could not send test notification.'));
    }
  };

  const toggleNotifications = () => {
    const newState = !notificationsActive;
    NotificationService.toggleNotifications(newState);
    setNotificationsActive(newState);
    setAlertProps({
      title: newState ? 'NOTIFICATIONS STARTED' : 'NOTIFICATIONS STOPPED',
      message: newState ? 'You will now receive task notifications.' : 'You will no longer receive task notifications.',
      type: 'default'
    });
  };

  const PermissionItem = ({ permission, onPress }) => (
    <View style={styles.permissionItem}>
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionIcon}>{permission.icon}</Text>
        <View style={styles.permissionText}>
          <Text style={styles.permissionTitle}>{permission.title.toUpperCase()}</Text>
          <Text style={styles.permissionDescription}>{permission.description}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.permissionButton,
          permission.granted && styles.permissionButtonEnabled
        ]}
        onPress={onPress}
        disabled={permission.granted || loading}
      >
        <Text style={[
          styles.permissionButtonText,
          permission.granted && styles.permissionButtonTextEnabled
        ]}>
          {permission.action}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={nothingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.black} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          {/* <Text style={styles.screenTitle}>Notifie</Text> */}
          <Text style={styles.subtitle}>
            Enable features for the complete Nothing experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REQUIRED PERMISSIONS</Text>
          <Text style={styles.sectionDescription}>
            These permissions enable core functionality
          </Text>

          {Object.entries(permissionStatus).map(([key, permission]) => (
            <PermissionItem
              key={key}
              permission={permission}
              onPress={() => handlePermissionRequest(key)}
            />
          ))}
        </View>

        {permissionStatus.notifications?.granted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATION CONTROLS</Text>
            
            <NothingButton
              title={notificationsActive ? "STOP NOTIFICATIONS" : "START NOTIFICATIONS"}
              onPress={toggleNotifications}
              variant={notificationsActive ? "danger" : "primary"}
              disabled={loading}
            />
            
            {notificationsActive && (
              <NothingButton
                title="TEST NOTIFICATION"
                onPress={testNotification}
                disabled={loading}
              />
            )}
            
            <View style={styles.notificationInfo}>
              <Text style={styles.infoText}>
                ● Persistent notification shows today's tasks
              </Text>
              <Text style={styles.infoText}>
                ● Updates automatically when tasks change
              </Text>
              <Text style={styles.infoText}>
                ● Optimized for Nothing Phone vibration patterns
              </Text>
              <Text style={styles.infoText}>
                ● Visible on lock screen and notification panel
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All permissions can be managed in device settings
          </Text>
          <Text style={styles.footerSubtext}>
            Settings - Apps - TaskManager - Permissions
          </Text>
        </View>
      </ScrollView>

      {alertProps && (
        <NothingAlert
          {...alertProps}
          onDismiss={() => setAlertProps(null)}
        />
      )}
    </View>
  );
};

const styles = {
  scrollContainer: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.l,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.l,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.l,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionDescription: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.surface,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIcon: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.l,
    color: theme.colors.accent,
    marginRight: theme.spacing.m,
    width: 30,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  permissionDescription: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  permissionButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  permissionButtonEnabled: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.surface,
  },
  permissionButtonText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  permissionButtonTextEnabled: {
    color: theme.colors.success,
  },
  notificationInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  infoText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  footerSubtext: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.lightGray,
    textAlign: 'center',
  },

};

export default PermissionsScreen;
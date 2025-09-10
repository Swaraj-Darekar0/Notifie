// src/services/PermissionsManager.js
import { Linking } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import NotificationService from './NotificationService';
import { NothingAlerts } from '../components/NothingAlert';

class PermissionsManager {
  // Check if notification permissions are granted
  async checkNotificationPermission() {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  async requestNotificationPermission(showAlert) {
    try {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        NotificationService.toggleNotifications(true);
        return true;
      }

      if (settings.authorizationStatus === AuthorizationStatus.BLOCKED) {
        showAlert(this.getSettingsAlert());
        return false;
      }

      return new Promise((resolve) => {
        showAlert({
          ...NothingAlerts.confirm(
            'ENABLE NOTIFICATIONS',
            'Allow notifications to keep your tasks visible and receive reminders.',
            async () => {
              const result = await notifee.requestPermission();
              const granted = result.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
              if (granted) {
                NotificationService.toggleNotifications(true);
              }
              resolve(granted);
            },
            () => resolve(false)
          ),
          type: 'warning',
        });
      });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showAlert(NothingAlerts.error('ERROR', 'Could not request permission.'));
      return false;
    }
  }

  getSettingsAlert() {
    return NothingAlerts.confirm(
      'PERMISSIONS REQUIRED',
      'Notification access is required. Please enable it in device settings.',
      () => Linking.openSettings(),
      () => {}
    );
  }

  // === METHODS NEEDED BY PermissionsScreen.js (Add these back) ===

  /**
   * Gets the permission status formatted for the UI.
   * This is called by PermissionsScreen.
   */
  async getPermissionStatusForUI() {
    const isGranted = await this.checkNotificationPermission();
    return {
      notifications: {
        granted: isGranted,
        title: 'Notifications',
        description: 'Show persistent tasks in notification panel',
        icon: isGranted ? '●●●' : '○○○',
        action: isGranted ? 'ENABLED' : 'ENABLE',
      },
    };
  }

  /**
   * Handles a permission request from the UI.
   * This is called by PermissionsScreen.
   */
  async handlePermissionRequest(permissionType, showAlert) {
    switch (permissionType) {
      case 'notifications':
        return await this.requestNotificationPermission(showAlert);
      default:
        console.warn('Unknown permission type:', permissionType);
        return false;
    }
  }
}

export default new PermissionsManager();
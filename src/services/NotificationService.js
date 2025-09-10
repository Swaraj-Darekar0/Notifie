// src/services/NotificationService.js
import notifee, {
  AndroidImportance,
  EventType,
  TimestampTrigger,
  TimeUnit,
  TriggerType,
} from '@notifee/react-native';
import { StorageUtils } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';

class NotificationService {
  constructor() {
    this.notificationsEnabled = false;
  }

  init() {
    this.createChannels();
    this.setupForegroundListener();
  }

  // Notifee handles this via listeners, no separate configure() needed
  setupForegroundListener() {
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;

      // User tapped a notification
      if (type === EventType.PRESS) {
        console.log('User pressed notification:', notification);
        // You could add navigation logic here if needed
      }

      // User tapped an action button (e.g., 'STOP')
      if (type === EventType.ACTION_PRESS && pressAction.id === 'stop') {
        console.log('User pressed the STOP action');
        this.toggleNotifications(false);
        if (notification.id) {
          await notifee.cancelNotification(notification.id);
        }
      }
    });
  }

  async createChannels() {
    await notifee.createChannel({
      id: 'nothing_tasks_persistent',
      name: 'Nothing Tasks',
      description: "Persistent notifications for today's tasks",
      playSound: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });
    console.log('Persistent channel created'); //

    await notifee.createChannel({
      id: 'nothing_task_actions',
      name: 'Task Actions',
      description: 'Sounds for task completion and actions',
      playSound: true,
      vibration: true,
      importance: AndroidImportance.DEFAULT,
    });
    console.log('Action channel created'); //
  }

  async toggleNotifications(enable) {
    this.notificationsEnabled = enable;

    if (enable) {
      console.log('Notifications enabled');
      this.showTodayTasksNotification();
      this.scheduleDailyUpdates();
    } else {
      console.log('Notifications disabled');
      await notifee.cancelAllNotifications();
    }
  }

  isNotificationsEnabled() {
    return this.notificationsEnabled;
  }

  async showTodayTasksNotification() {
    if (!this.notificationsEnabled) return;

    try {
      const todayTasks = await StorageUtils.getTodayTasks();
      if (todayTasks.length === 0) {
        await this.clearPersistentNotification();
        return;
      }

      const incompleteTasks = todayTasks.filter(task => !task.completed);
      const completedCount = todayTasks.length - incompleteTasks.length;

      const title =
        incompleteTasks.length > 0
          ? `${incompleteTasks.length} TASK${incompleteTasks.length !== 1 ? 'S' : ''} TODAY`
          : `${completedCount} TASK${completedCount !== 1 ? 'S' : ''} COMPLETED`;

      const body = this.formatTaskList(incompleteTasks.slice(0, 3));
      const bigText = this.formatDetailedTaskList(todayTasks);

      await notifee.displayNotification({
        id: 'tasks-today',
        title: title,
        body: body,
        android: {
          channelId: 'nothing_tasks_persistent',
          style: { type: 1, text: bigText }, // AndroidStyle.BIGTEXT = 1
          ongoing: true,
          autoCancel: false,
          color: '#FF0000',
          smallIcon: 'ic_notification', // Ensure this exists in android/app/src/main/res/drawable
          actions: [
            {
              title: 'STOP',
              pressAction: { id: 'stop' },
            },
          ],
        },
      });
      console.log('Local notification displayed with Notifee.');
    } catch (error) {
      console.error('Error showing notification with Notifee:', error);
    }
  }

  formatTaskList(tasks) {
    if (tasks.length === 0) return 'ALL TASKS COMPLETED';
    return tasks.map(task => task.title.toUpperCase()).join(' | ');
  }

  formatDetailedTaskList(tasks) {
    const incomplete = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    let text = '';
    if (incomplete.length > 0) {
      text += 'PENDING TASKS:\n' + incomplete.map(t => t.title).join('\n');
    }
    if (completed.length > 0) {
      text += `\n\nCOMPLETED (${completed.length}):\n` + completed.map(t => `✓ ${t.title}`).join('\n');
    }
    return text.trim();
  }

  async clearPersistentNotification() {
    await notifee.cancelNotification('tasks-today');
  }

  async updateTodayTasksNotification() {
    if (!this.notificationsEnabled) return;
    await this.showTodayTasksNotification();
  }

  async scheduleDailyUpdates() {
    if (!this.notificationsEnabled) return;

    // Cancel any existing trigger
    await notifee.cancelTriggerNotification('hourly_update');

    // Create a trigger that repeats every 4 hours
    const trigger = {
      type: TriggerType.INTERVAL,
      interval: 6,
      timeUnit: TimeUnit.HOURS,
    };

    // Create the trigger notification
    await notifee.createTriggerNotification(
      {
        id: 'hourly_update',
        title: 'Task Reminder',
        body: 'Updating your task summary...',
        android: {
          channelId: 'nothing_tasks_persistent',
        },
      },
      trigger
    );
  }
}

export default new NotificationService();
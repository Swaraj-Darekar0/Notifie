// index.js

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { StorageUtils } from './src/utils/storage'; // <-- IMPORT StorageUtils
import NotificationService from './src/services/NotificationService';

/**
 * Notifee background event handler.
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;

  // Check if the event is a notification being delivered and if it's our hourly trigger
  if (type === EventType.DELIVERED && notification.id === 'hourly_update') {
    console.log('Hourly trigger received. Fetching latest task data...');

    // 1. Fetch the latest task data
    const todayTasks = await StorageUtils.getTodayTasks();
    const incompleteTasks = todayTasks.filter(task => !task.completed);
    const completedCount = todayTasks.length - incompleteTasks.length;

    // If there are no tasks for today, do nothing.
    if (todayTasks.length === 0) {
      console.log('No tasks for today, skipping summary notification.');
      return;
    }
    
    // 2. Build the dynamic title and body for the notification
    const title = `${incompleteTasks.length} PENDING TASK${incompleteTasks.length !== 1 ? 'S' : ''}`;
    const body = `You have completed ${completedCount} of ${todayTasks.length} tasks for today.`;
    
    // 3. Display the new, updated notification
    await notifee.displayNotification({
      id: 'task-summary-display', // A different ID for the visible notification
      title: title,
      body: body,
      android: {
        channelId: 'nothing_tasks_persistent',
        style: { 
          type: 1, // BIGTEXT
          text: NotificationService.formatDetailedTaskList(todayTasks) 
        },
        pressAction: {
          id: 'default',
        },
      },
    });

    console.log('Displayed updated task summary notification.');
  }

  // Handle the "STOP" action from the persistent notification
  if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'stop') {
      NotificationService.toggleNotifications(false);
      if (notification.id) {
          await notifee.cancelNotification(notification.id);
      }
  }
});


AppRegistry.registerComponent(appName, () => App);
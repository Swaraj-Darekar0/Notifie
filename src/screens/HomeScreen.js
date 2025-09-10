import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  StatusBar 
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme, nothingStyles } from '../styles/theme';
import { StorageUtils } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';
import TaskItem from '../components/TaskItem';
import NothingButton from '../components/NothingButton';
import NotificationService from '../services/NotificationService';

const HomeScreen = ({ navigation }) => {
  const [currentView, setCurrentView] = useState(0); // 0: today, 1: tomorrow, 2: upcoming
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasksForView = useCallback(async (viewIndex) => {
    const allTasksData = await StorageUtils.loadTasks();
    
    let filteredTasks = [];
    const today = DateUtils.getTodayString();
    const tomorrow = DateUtils.getTomorrowString();
    
    switch(viewIndex) {
      case 0: // Today
        filteredTasks = allTasksData.filter(task => task.dueDate === today);
        break;
      case 1: // Tomorrow
        filteredTasks = allTasksData.filter(task => task.dueDate === tomorrow);
        break;
      case 2: // Upcoming
        filteredTasks = allTasksData.filter(task => {
          const taskDate = new Date(task.dueDate);
          const tomorrowDate = new Date(tomorrow);
          return taskDate > tomorrowDate;
        });
        break;
    }
    setTasks(filteredTasks);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasksForView(currentView);
    setRefreshing(false);
  }, [currentView, loadTasksForView]);

  useFocusEffect(
    useCallback(() => {
      loadTasksForView(currentView);
    }, [currentView, loadTasksForView])
  );

  useEffect(() => {
    const titles = ['TODAY', 'TOMORROW', 'UPCOMING'];
    navigation.setOptions({ title: titles[currentView] });
  }, [currentView, navigation]);

  const handleTaskToggle = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = await StorageUtils.updateTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      
      if (updatedTask) {
        await loadTasksForView(currentView);
        if (task.dueDate === DateUtils.getTodayString()) {
          await NotificationService.updateTodayTasksNotification();
        }
      }
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const onGestureEvent = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > 50 && currentView > 0) {
        // Swipe right - go back
        setCurrentView(currentView - 1);
      } else if (translationX < -50 && currentView < 2) {
        // Swipe left - go forward
        setCurrentView(currentView + 1);
      }
    }
  };

  const getEmptyStateText = () => {
    switch(currentView) {
      case 0: return 'NO TASKS FOR TODAY';
      case 1: return 'NO TASKS FOR TOMORROW';
      case 2: return 'NO UPCOMING TASKS';
      default: return 'NO TASKS';
    }
  };

  return (
    <View style={nothingStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.black}
      />
      
      <Text style={styles.dateHeader}>
        {DateUtils.formatDateHeader(new Date())}
      </Text>
      <PanGestureHandler onHandlerStateChange={onGestureEvent}>
        <ScrollView
          style={styles.taskList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.white}
            />
          }
        >
          {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{getEmptyStateText()}</Text>
              <Text style={styles.emptySubtext}>
                Tap the button below to create your first task
              </Text>
            </View>
          ) : (
            <>
              {incompleteTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleTaskToggle}
                  showDueDate={currentView === 2}
                />
              ))}
              
              {completedTasks.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>
                    COMPLETED ({completedTasks.length})
                  </Text>
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleTaskToggle}
                      showDueDate={currentView === 2}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </PanGestureHandler>
      <View style={styles.footer}>
        {incompleteTasks.length > 0 && (
          <Text style={styles.summary}>
            {incompleteTasks.length} TASKS REMAINING
          </Text>
        )}
        
        <NothingButton
          title="[+] ADD TASK"
          onPress={() => navigation.navigate('AddTask')}
        />
      </View>
    </View>
  );
};

const styles = {
  dateHeader: {
    fontFamily: theme.typography.fontFamily.system,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
  },
  
  taskList: {
    flex: 1,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.l,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.lightGray,
    textAlign: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  
  footer: {
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  summary: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  }
};

export default HomeScreen;
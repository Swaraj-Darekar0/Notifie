import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import NothingAlert, { NothingAlerts } from '../components/NothingAlert';
import { useFocusEffect } from '@react-navigation/native';
import { theme, nothingStyles } from '../styles/theme';
import { StorageUtils } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';
import TaskItem from '../components/TaskItem';
import NothingButton from '../components/NothingButton';
import NotificationService from '../services/NotificationService';
const AllTasksScreen = ({ navigation }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [alertProps, setAlertProps] = useState(null);

  const tabs = [
    { id: 'today', label: 'TODAY' },
    { id: 'tomorrow', label: 'TOMORROW' },
    { id: 'upcoming', label: 'UPCOMING' },
    { id: 'all', label: 'ALL' },
  ];

  const loadAllTasks = async () => {
    const tasks = await StorageUtils.loadTasks();
    setAllTasks(tasks);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllTasks();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllTasks();
    }, [])
  );

  const getFilteredTasks = () => {
    const today = DateUtils.getTodayString();
    const tomorrow = DateUtils.getTomorrowString();

    switch (activeTab) {
      case 'today':
        return allTasks.filter(task => task.dueDate === today);
      case 'tomorrow':
        return allTasks.filter(task => task.dueDate === tomorrow);
      case 'upcoming':
        return allTasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          const todayDate = new Date(today);
          return taskDate > todayDate;
        });
      case 'all':
      default:
        return allTasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const incompleteTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const handleTaskToggle = async (taskId) => {
    const today = DateUtils.getTodayString();
if (task.dueDate === today) {
  await NotificationService.updateTodayTasksNotification();
}
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = await StorageUtils.updateTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      
      if (updatedTask) {
        await loadAllTasks();
      }
    }
  };

  const handleDeleteTask = async(taskId) => {
    const today = DateUtils.getTodayString();
    if (task.dueDate === today) {
      await NotificationService.updateTodayTasksNotification();
    }
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    setAlertProps(NothingAlerts.delete(
      'DELETE TASK',
      `Are you sure you want to delete "${task.title}"?`,
      async () => {
        const success = await StorageUtils.deleteTask(taskId);
        if (success) {
          await loadAllTasks();
        }
      }
    ));
  };

  const getTaskStats = () => {
    const todayTasks = allTasks.filter(task => task.dueDate === DateUtils.getTodayString());
    const tomorrowTasks = allTasks.filter(task => task.dueDate === DateUtils.getTomorrowString());
    const upcomingTasks = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const todayDate = new Date(DateUtils.getTodayString());
      return taskDate > todayDate;
    });

    return {
      today: todayTasks.length,
      tomorrow: tomorrowTasks.length,
      upcoming: upcomingTasks.length,
      total: allTasks.length,
    };
  };

  const stats = getTaskStats();

  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.id;
    let count = 0;
    
    switch (tab.id) {
      case 'today':
        count = stats.today;
        break;
      case 'tomorrow':
        count = stats.tomorrow;
        break;
      case 'upcoming':
        count = stats.upcoming;
        break;
      case 'all':
        count = stats.total;
        break;
    }

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tabButton, isActive && styles.activeTab]}
        onPress={() => setActiveTab(tab.id)}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab.label} ({count})
        </Text>
        {isActive && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderTaskSection = (tasks, title, isCompleted = false) => {
    if (tasks.length === 0) return null;

    return (
      <View style={styles.taskSection}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => isCompleted && setShowCompleted(!showCompleted)}
        >
          <Text style={styles.sectionTitle}>
            {title} ({tasks.length})
          </Text>
          {isCompleted && (
            <Text style={styles.toggleText}>
              {showCompleted ? '[-]' : '[+]'}
            </Text>
          )}
        </TouchableOpacity>
        
        {(!isCompleted || showCompleted) && (
          <View style={styles.taskList}>
            {tasks.map(task => (
              <View key={task.id} style={styles.taskItemContainer}>
                <TaskItem
                  task={task}
                  onToggle={handleTaskToggle}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(task.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {activeTab === 'today' ? 'NO TASKS FOR TODAY' :
         activeTab === 'tomorrow' ? 'NO TASKS FOR TOMORROW' :
         activeTab === 'upcoming' ? 'NO UPCOMING TASKS' :
         'NO TASKS CREATED YET'}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'all' 
          ? 'Create your first task to get started'
          : 'All clear for this period'}
      </Text>
    </View>
  );

  return (
    <View style={nothingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.black} />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Task Content */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.white}
          />
        }
      >
        {filteredTasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Active Tasks */}
            {renderTaskSection(incompleteTasks, 'ACTIVE')}
            
            {/* Completed Tasks */}
            {renderTaskSection(completedTasks, 'COMPLETED', true)}
          </>
        )}

        {/* Task Statistics */}
        {allTasks.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>OVERVIEW</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.today}</Text>
                <Text style={styles.statLabel}>TODAY</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.tomorrow}</Text>
                <Text style={styles.statLabel}>TOMORROW</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.upcoming}</Text>
                <Text style={styles.statLabel}>UPCOMING</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>TOTAL</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Task Button */}
      <View style={styles.actionContainer}>
        <NothingButton
          title="[+] ADD NEW TASK"
          onPress={() => navigation.navigate('AddTask')}
        />
      </View>
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  
  tabScrollContent: {
    paddingHorizontal: theme.spacing.m,
  },
  
  tabButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    marginRight: theme.spacing.s,
    position: 'relative',
  },
  
  activeTab: {
    // Active state handled by text color and indicator
  },
  
  tabText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  activeTabText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: theme.spacing.l,
    right: theme.spacing.l,
    height: 2,
    backgroundColor: theme.colors.white,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  taskSection: {
    marginBottom: theme.spacing.l,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  
  toggleText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
  },
  
  taskList: {
    // Tasks will be rendered here
  },
  
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s,
  },
  
  deleteButtonText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 20,
    color: theme.colors.nothingRed,
    fontWeight: 'bold',
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
  
  statsSection: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.l,
  },
  
  statsTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    letterSpacing: 0.5,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statValue: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  statLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
  },
};

export default AllTasksScreen;
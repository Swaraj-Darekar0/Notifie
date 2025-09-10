import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme, nothingStyles } from '../styles/theme';
import { DateUtils } from '../utils/dateUtils';
import PriorityIndicator from './PriorityIndicator';

const TaskItem = ({ task, onToggle, showDueDate = false }) => {
  const handlePress = () => {
    onToggle(task.id);
  };

  return (
    <TouchableOpacity 
      style={nothingStyles.taskItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {task.completed ? (
          <View style={styles.checkedBox}>
            <Text style={styles.checkmark}>●</Text>
          </View>
        ) : (
          <View style={styles.uncheckedBox} />
        )}
      </View>
      
      <Text 
        style={[
          nothingStyles.taskText,
          task.completed && styles.completedText
        ]}
      >
        {task.title}
      </Text>
      
      <PriorityIndicator priority={task.priority} />
     {showDueDate && (
        <Text style={styles.dueDateText}>
          {DateUtils.getRelativeDateDisplay(task.dueDate)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  checkbox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  uncheckedBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.white,
    backgroundColor: 'transparent',
  },
  
  checkedBox: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkmark: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  completedText: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  dueDateText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  }
};

export default TaskItem;
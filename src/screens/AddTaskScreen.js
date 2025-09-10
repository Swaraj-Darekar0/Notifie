import React, { useState } from 'react';
import NothingDatePicker from '../components/NothingDatePicker';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import NothingAlert, { NothingAlerts } from '../components/NothingAlert';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme, nothingStyles } from '../styles/theme';
import { StorageUtils } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';
import NothingButton from '../components/NothingButton';
import NotificationService from '../services/NotificationService';
const AddTaskScreen = ({ navigation }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedPriority, setSelectedPriority] = useState('normal');
  const [isCreating, setIsCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCustomDate, setSelectedCustomDate] = useState(new Date());
  const [alertProps, setAlertProps] = useState(null);

const dateOptions = [
  { label: 'TODAY', value: 'today' },
  { label: 'TOMORROW', value: 'tomorrow' },
  { label: 'UPCOMING', value: 'upcoming' },
];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedCustomDate(selectedDate);
      setSelectedDate('upcoming');
    }
  };

  const priorityOptions = [
    { label: 'NORMAL', value: 'normal' },
    { label: 'HIGH', value: 'high' },
    { label: 'CRITICAL', value: 'critical' },
  ];

  const getDateFromSelection = (selection) => {
  const today = new Date();
  switch (selection) {
    case 'today':
      return today.toISOString().split('T')[0];
    case 'tomorrow':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    case 'upcoming':
      return selectedCustomDate.toISOString().split('T')[0];
    default:
      return today.toISOString().split('T')[0];
  }
};

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      setAlertProps(NothingAlerts.error('ERROR', 'Task title is required'));
      return;
    }

    setIsCreating(true);

    const newTask = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      dueDate: getDateFromSelection(selectedDate),
      priority: selectedPriority,
    };

    try {
      const createdTask = await StorageUtils.addTask(newTask);
      
      if (createdTask) {
        const today = DateUtils.getTodayString();
        // if (createdTask.dueDate === today) {
        //    await NotificationService.updateTodayTasksNotification();
        // }
        // Success feedback
        setAlertProps(NothingAlerts.success('SUCCESS', 'Task created successfully', () => navigation.goBack()));
      } else {
        setAlertProps(NothingAlerts.error('ERROR', 'Failed to create task'));
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setAlertProps(NothingAlerts.error('ERROR', 'Something went wrong'));
    } finally {
      setIsCreating(false);
    }
  };

  const renderDateOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionButton,
        selectedDate === option.value && styles.selectedOption
      ]}
      onPress={() => {
        if (option.value === 'upcoming') {
          setShowDatePicker(true);
        } else {
          setSelectedDate(option.value);
        }
      }}
    >
      <Text style={[
        styles.optionText,
        selectedDate === option.value && styles.selectedOptionText
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderPriorityOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionButton,
        selectedPriority === option.value && styles.selectedOption
      ]}
      onPress={() => setSelectedPriority(option.value)}
    >
      <View style={styles.priorityOptionContent}>
        <Text style={[
          styles.optionText,
          selectedPriority === option.value && styles.selectedOptionText
        ]}>
          {option.label}
        </Text>
        {option.value === 'high' && (
          <View style={styles.priorityIndicator}>
            <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
            
          </View>
        )}
        {option.value === 'critical' && (
          <View style={styles.priorityIndicator}>
            <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
            <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={nothingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.black} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Task Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>TASK DESCRIPTION</Text>
          <TextInput
            style={styles.textInput}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Enter task title..."
            placeholderTextColor={theme.colors.lightGray}
            maxLength={100}
            autoFocus={true}
          />
          <Text style={styles.characterCount}>
            {taskTitle.length}/100
          </Text>
        </View>

        {/* Task Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>ADDITIONAL NOTES</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="Optional details..."
            placeholderTextColor={theme.colors.lightGray}
            multiline={true}
            numberOfLines={3}
            maxLength={300}
          />
          <Text style={styles.characterCount}>
            {taskDescription.length}/300
          </Text>
        </View>

        {/* Due Date Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>DUE DATE</Text>
          <View style={styles.optionsContainer}>
            {dateOptions.map(renderDateOption)}
          </View>
          {selectedDate === 'upcoming' && (
  <>
    <TouchableOpacity 
      style={styles.dateButton}
      onPress={() => setShowDatePicker(true)}
    >
      <Text style={styles.dateButtonText}>
        SELECT DATE: {selectedCustomDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        }).toUpperCase()}
      </Text>
    </TouchableOpacity>

  </>
)}
        </View>

        {/* Priority Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>PRIORITY LEVEL</Text>
          <View style={styles.optionsContainer}>
            {priorityOptions.map(renderPriorityOption)}
          </View>
        </View>

        {/* Task Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>PREVIEW</Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewTask}>
              <View style={styles.previewCheckbox} />
              <Text style={styles.previewTaskText}>
                {taskTitle || 'Task title will appear here...'}
              </Text>
              <View style={styles.previewPriority}>
                {selectedPriority === 'normal' && (
                  <View style={[styles.priorityDot, { backgroundColor: theme.colors.lightGray }]} />
                )}
                {selectedPriority === 'high' && (
                  <>
                    <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
                    
                    
                  </>
                )}
                {selectedPriority === 'critical' && (
                  <>
                    <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
                    <View style={[styles.priorityDot, { backgroundColor: theme.colors.nothingRed }]} />
                  </>
                )}
              </View>
            </View>
            <Text style={styles.previewDate}>
              Due: {DateUtils.getRelativeDateDisplay(getDateFromSelection(selectedDate))}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <NothingButton
              title="CANCEL"
              variant="ghost"
              onPress={() => navigation.goBack()}
              disabled={isCreating}
            />
          </View>
          <View style={styles.buttonHalf}>
            <NothingButton
              title={isCreating ? "CREATING..." : "CREATE TASK"}
              onPress={handleCreateTask}
              disabled={isCreating || !taskTitle.trim()}
            />
          </View>
        </View>
      </View>
      <NothingDatePicker
        visible={showDatePicker}
        selectedDate={selectedCustomDate}
        onDateChange={setSelectedCustomDate}
        onClose={() => setShowDatePicker(false)}
      />
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
  
  inputSection: {
    marginBottom: theme.spacing.l,
  },
  
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    letterSpacing: 0.5,
  },
  
  textInput: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.white,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.m,
    textAlignVertical: 'top',
  },
  
  multilineInput: {
    height: 80,
  },
  
  characterCount: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.lightGray,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  
  optionButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  
  selectedOption: {
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.deepGray,
  },
  
  optionText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  selectedOptionText: {
    color: theme.colors.white,
  },
  
  priorityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  priorityIndicator: {
    flexDirection: 'row',
    marginLeft: theme.spacing.xs,
  },
  
  priorityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  
  criticalIndicator: {
    color: theme.colors.nothingRed,
    fontSize: 12,
  },
  
  previewSection: {
    marginBottom: theme.spacing.xl,
  },
  
  previewContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.deepGray,
  },
  
  previewTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  previewCheckbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.white,
    marginRight: theme.spacing.s,
  },
  
  previewTaskText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.white,
    flex: 1,
  },
  
  previewPriority: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  criticalPreview: {
    color: theme.colors.nothingRed,
    fontSize: 12,
  },
  
  previewDate: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
  
  buttonHalf: {
    flex: 1,
  },
};

export default AddTaskScreen;
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, PanResponder } from 'react-native';
import { theme } from '../styles/theme';

const NothingDatePicker = ({ selectedDate, onDateChange, visible, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe right
        setCurrentMonth(currentMonth > 0 ? currentMonth - 1 : 11);
      } else if (gestureState.dx < -50) {
        // Swipe left
        setCurrentMonth(currentMonth < 11 ? currentMonth + 1 : 0);
      }
    },
  });

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentMonth && 
                        selectedDate.getFullYear() === currentYear;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isSelected && styles.selectedDay]}
          onPress={() => handleDayPress(day)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {day.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }

    const totalCells = 42; // 6 weeks * 7 days
    while (days.length < totalCells) {
      days.push(<View key={`empty-end-${days.length}`} style={styles.dayCell} />);
    }

    return days;
  };

  const handleDayPress = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateChange(newDate);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentYear(currentYear - 1)}>
              <Text style={styles.navButton}>{'<'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerText}>
               {currentYear}
            </Text>
            
            <TouchableOpacity onPress={() => setCurrentYear(currentYear + 1)}>
              <Text style={styles.navButton}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Text style={styles.headerText}>
              {months[currentMonth]}
            </Text>
          </View>

          {/* Days Grid */}
          <View style={styles.calendar} {...panResponder.panHandlers}>
            {/* Day Headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={index} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
            
            {/* Calendar Days */}
            {renderCalendar()}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
              <Text style={styles.confirmText}>SELECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.black,
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.white,
    padding: theme.spacing.l,
    width: '90%',
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.s,
  },
  headerText: {
    fontFamily: theme.typography.fontFamily.system,
    fontSize: theme.typography.fontSize.l,
    color: theme.colors.white
    
  },
  navButton: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.l,
    color: theme.colors.offWhite,
    paddingHorizontal: theme.spacing.s,
    fontWeight: theme.typography.fontWeight.bold,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.l,
  },
  dayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
  },
  dayHeaderText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDay: {
    borderColor: theme.colors.nothingRed,
    backgroundColor: theme.colors.deepGray,
  },
  dayText: {
    fontFamily: theme.typography.fontFamily.system,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.white,
  },
  selectedDayText: {
    color: theme.colors.nothingRed
    
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: theme.layout.borderWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.border,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    marginLeft: theme.spacing.s,
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.nothingRed,
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textSecondary,
  },
  confirmText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.nothingRed,
    fontWeight: theme.typography.fontWeight.medium,
  },
};

export default NothingDatePicker;
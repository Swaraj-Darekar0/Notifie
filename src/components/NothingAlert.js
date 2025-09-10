// src/components/NothingAlert.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../styles/theme';

const NothingAlert = ({ 
  visible, 
  title, 
  message, 
  buttons = [], 
  onDismiss,
  type = 'default' // 'default', 'warning', 'error', 'success'
}) => {
  
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          borderColor: theme.colors.nothingRed,
          titleColor: theme.colors.nothingRed,
          iconSymbol: '●●●',
        };
      case 'warning':
        return {
          borderColor: theme.colors.warning || '#ffffffff',
          titleColor: theme.colors.warning || '#ffffffff',
          iconSymbol: '●●○',
        };
      case 'success':
        return {
          borderColor: theme.colors.text,
          titleColor: theme.colors.text,
          iconSymbol: '●○○',
        };
      default:
        return {
          borderColor: theme.colors.white,
          titleColor: theme.colors.white,
          iconSymbol: '○○○',
        };
    }
  };

  const alertStyles = getAlertStyles();

  const defaultButtons = buttons.length > 0 ? buttons : [
    {
      text: 'OK',
      style: 'default',
      onPress: onDismiss,
    }
  ];

  const renderButton = (button, index) => {
    const isDestructive = button.style === 'destructive';
    const isCancel = button.style === 'cancel';
    const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.button,
          isDestructive && styles.destructiveButton,
          isCancel && styles.cancelButton,
          isPrimary && styles.primaryButton,
          index > 0 && styles.buttonSpacing
        ]}
        onPress={() => {
          button.onPress?.();
          onDismiss?.();
        }}
      >
        <Text style={[
          styles.buttonText,
          isDestructive && styles.destructiveButtonText,
          isCancel && styles.cancelButtonText,
          isPrimary && styles.primaryButtonText,
        ]}>
          {button.text.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { borderColor: alertStyles.borderColor }]}>
          
          {/* Header with icon */}
          <View style={styles.header}>
            <Text style={[styles.icon, { color: alertStyles.titleColor }]}>
              {alertStyles.iconSymbol}
            </Text>
            <Text style={[styles.title, { color: alertStyles.titleColor }]}>
              {title.toUpperCase()}
            </Text>
          </View>

          {/* Message content */}
          <View style={styles.content}>
            <Text style={styles.message}>
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => renderButton(button, index))}
          </View>

          {/* Bottom border accent */}
          <View style={[styles.accent, { backgroundColor: alertStyles.borderColor }]} />
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  alertContainer: {
    backgroundColor: theme.colors.black,
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.white,
    width: '100%',
    maxWidth: 320,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.border,
  },
  icon: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.l,
    marginRight: theme.spacing.m,
  },
  title: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.m,
    fontWeight: theme.typography.fontWeight.bold,
    flex: 1,
  },
  content: {
    padding: theme.spacing.l,
  },
  message: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.white,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: theme.layout.borderWidth,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonSpacing: {
    borderLeftWidth: theme.layout.borderWidth,
    borderLeftColor: theme.colors.border,
  },
  primaryButton: {
    backgroundColor: theme.colors.deepGray,
  },
  destructiveButton: {
    backgroundColor: 'transparent',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.s,
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryButtonText: {
    color: theme.colors.white,
  },
  destructiveButtonText: {
    color: theme.colors.nothingRed,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
};

// Helper function to show Nothing-styled alerts
export const showNothingAlert = (title, message, buttons = [], type = 'default') => {
  // This would need to be implemented with a global alert provider
  // For now, return the component props
  return {
    title,
    message,
    buttons,
    type,
    visible: true,
  };
};

// Pre-configured alert types
export const NothingAlerts = {
  success: (title, message, onPress) => ({
    title,
    message,
    type: 'success',
    buttons: [{ text: 'OK', style: 'default', onPress }],
  }),
  
  error: (title, message, onPress) => ({
    title,
    message,
    type: 'error',
    buttons: [{ text: 'OK', style: 'default', onPress }],
  }),
  
  confirm: (title, message, onConfirm, onCancel) => ({
    title,
    message,
    type: 'warning',
    buttons: [
      { text: 'CANCEL', style: 'cancel', onPress: onCancel },
      { text: 'CONFIRM', style: 'destructive', onPress: onConfirm },
    ],
  }),
  
  delete: (title, message, onDelete, onCancel) => ({
    title,
    message,
    type: 'error',
    buttons: [
      { text: 'CANCEL', style: 'cancel', onPress: onCancel },
      { text: 'DELETE', style: 'destructive', onPress: onDelete },
    ],
  }),
};

export default NothingAlert;
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme, nothingStyles } from '../styles/theme';

const NothingButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false 
}) => {
  const getButtonStyle = () => {
    const baseStyle = { ...nothingStyles.button };
    
    switch (variant) {
      case 'danger':
        return {
          ...baseStyle,
          borderColor: theme.colors.nothingRed,
        };
      case 'ghost':
        return {
          ...baseStyle,
          borderColor: theme.colors.lightGray,
        };
      default:
        return baseStyle;
    }
  };
  
  const getTextStyle = () => {
    const baseStyle = { ...nothingStyles.buttonText };
    
    if (variant === 'danger') {
      return { ...baseStyle, color: theme.colors.nothingRed };
    }
    if (disabled) {
      return { ...baseStyle, color: theme.colors.lightGray };
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default NothingButton;
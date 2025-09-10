import React from 'react';
import { View } from 'react-native';
import { theme, nothingStyles } from '../styles/theme';

const PriorityIndicator = ({ priority = 'normal' }) => {
  const getDotCount = () => {
    switch (priority) {
      case 'high': return 2;
      case 'critical': return 3;
      default: return 1;
    }
  };
  
  const getDotColor = () => {
    switch (priority) {
      case 'high': return theme.colors.nothingRed;
      case 'critical': return theme.colors.nothingRed;
      default: return theme.colors.lightGray;
    }
  };
  
  const dotCount = getDotCount();
  const dotColor = getDotColor();
  
  return (
    <View style={nothingStyles.priorityDots}>
      {Array.from({ length: dotCount }, (_, index) => (
        <View 
          key={index}
          style={[
            nothingStyles.dot,
            { backgroundColor: dotColor }
          ]} 
        />
      ))}
    </View>
  );
};

export default PriorityIndicator;
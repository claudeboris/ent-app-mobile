import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium';
}

export default function Badge({ 
  text, 
  variant = 'primary', 
  size = 'medium' 
}: BadgeProps) {
  const getBadgeStyle = () => {
    let style = styles.badge;
    
    if (size === 'small') {
      style = { ...style, paddingVertical: 4, paddingHorizontal: 8 };
    }
    
    switch (variant) {
      case 'secondary':
        return { ...style, backgroundColor: '#E8EAF6' };
      case 'success':
        return { ...style, backgroundColor: '#E8F5E9' };
      case 'error':
        return { ...style, backgroundColor: '#FFEBEE' };
      default:
        return { ...style, backgroundColor: '#E3F2FD' };
    }
  };

  const getTextStyle = () => {
    let style = styles.text;
    
    if (size === 'small') {
      style = { ...style, fontSize: 10 };
    }
    
    switch (variant) {
      case 'secondary':
        return { ...style, color: Colors.secondary };
      case 'success':
        return { ...style, color: Colors.success };
      case 'error':
        return { ...style, color: Colors.error };
      default:
        return { ...style, color: Colors.primary };
    }
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
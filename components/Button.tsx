import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: object;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  title, 
  onPress, 
  style, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium'
}: ButtonProps) {
  const getButtonStyle = () => {
    let baseStyle = styles.button;
    
    if (size === 'small') {
      baseStyle = { ...baseStyle, paddingVertical: 10 };
    } else if (size === 'large') {
      baseStyle = { ...baseStyle, paddingVertical: 18 };
    }
    
    if (variant === 'secondary') {
      baseStyle = { ...baseStyle, backgroundColor: Colors.secondary };
    } else if (variant === 'outline') {
      baseStyle = { 
        ...baseStyle, 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary
      };
    }
    
    if (disabled) {
      baseStyle = { ...baseStyle, backgroundColor: '#BDBDBD' };
    }
    
    return [baseStyle, style];
  };

  const getTextStyle = () => {
    let textStyle = styles.text;
    
    if (variant === 'outline') {
      textStyle = { ...textStyle, color: Colors.primary };
    }
    
    if (disabled) {
      textStyle = { ...textStyle, color: '#FFFFFF' };
    }
    
    return textStyle;
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
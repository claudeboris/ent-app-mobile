import { View, StyleSheet } from 'react-native';

interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
}

export default function Divider({ 
  color = '#E0E0E0', 
  thickness = 1, 
  marginVertical = 15 
}: DividerProps) {
  return (
    <View 
      style={[
        styles.divider, 
        { 
          borderBottomColor: color, 
          borderBottomWidth: thickness,
          marginVertical
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});
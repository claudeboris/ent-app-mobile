import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
}

export default function ListItem({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  rightComponent,
  showChevron = true
}: ListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {icon && (
        <Ionicons name={icon as any} size={24} color="#1A237E" style={styles.icon} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent}
        {showChevron && !rightComponent && (
          <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  icon: {
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  rightContainer: {
    marginLeft: 10,
  },
});
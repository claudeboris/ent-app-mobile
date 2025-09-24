import { View, Text, StyleSheet, Image } from 'react-native';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: any;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({ 
  title, 
  description, 
  image, 
  buttonText, 
  onButtonPress 
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {image && (
        <Image 
          source={image} 
          style={styles.image}
          resizeMode="contain"
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      {buttonText && onButtonPress && (
        <Button 
          title={buttonText} 
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: '80%',
  },
});
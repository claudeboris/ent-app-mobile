import { View, Text, StyleSheet, Image } from 'react-native';

interface AvatarProps {
  source?: any;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Avatar({ source, name, size = 'medium' }: AvatarProps) {
  const getAvatarSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 80;
      default: return 60;
    }
  };

  const getInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const avatarSize = getAvatarSize();
  const fontSize = avatarSize / 3;

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      {source ? (
        <Image 
          source={source} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
});
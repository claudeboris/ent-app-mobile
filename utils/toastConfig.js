// utils/toastConfig.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <View style={styles.successContainer}>
      <Text style={styles.successText}>{props.text1}</Text>
      {props.text2 && <Text style={styles.successSubText}>{props.text2}</Text>}
    </View>
  ),
  error: (props) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{props.text1}</Text>
      {props.text2 && <Text style={styles.errorSubText}>{props.text2}</Text>}
    </View>
  ),
  info: (props) => (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>{props.text1}</Text>
      {props.text2 && <Text style={styles.infoSubText}>{props.text2}</Text>}
      {props.props?.onConfirm && (
        <View style={styles.infoButtons}>
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => {
              Toast.hide();
              props.props.onConfirm();
            }}
          >
            <Text style={styles.infoButtonText}>Confirmer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.infoButton, styles.cancelButton]} 
            onPress={() => {
              if (props.props.onCancel) props.props.onCancel();
              else Toast.hide();
            }}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  successContainer: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successSubText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  infoButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 10,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default toastConfig;
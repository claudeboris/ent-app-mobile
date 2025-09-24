import { View, StyleSheet } from 'react-native';
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field';

interface OTPInputProps {
  value: string;
  setValue: (value: string) => void;
  cellCount?: number;
}

export default function OTPInput({ 
  value, 
  setValue, 
  cellCount = 6 
}: OTPInputProps) {
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <CodeField
      {...props}
      value={value}
      onChangeText={setValue}
      cellCount={cellCount}
      rootStyle={styles.codeFieldRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={({ index, symbol, isFocused }) => (
        <View
          key={index}
          style={[styles.cellRoot, isFocused && styles.focusCell]}
          onLayout={getCellOnLayoutHandler(index)}
        >
          <Text style={styles.cellText}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginTop: 20,
    marginBottom: 40,
  },
  cellRoot: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 2,
    marginHorizontal: 8,
  },
  cellText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#1A237E',
  },
  focusCell: {
    borderBottomColor: '#3949AB',
    borderBottomWidth: 2,
  },
});
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helper?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  inputProps?: TextInputProps;
};

export const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  multiline,
  keyboardType,
  inputProps
}: FieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multiline, inputProps?.style]}
      />
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800'
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16
  },
  multiline: {
    minHeight: 98,
    textAlignVertical: 'top'
  },
  helper: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17
  }
});

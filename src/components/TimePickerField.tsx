import { Clock3 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const createTimeOptions = () =>
  Array.from({ length: 96 }, (_, index) => {
    const hour = Math.floor(index / 4);
    const minute = (index % 4) * 15;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

export const TimePickerField = ({ label, value, onChange }: TimePickerFieldProps) => {
  const [visible, setVisible] = useState(false);
  const options = useMemo(createTimeOptions, []);

  const select = (time: string) => {
    onChange(time);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.field}>
        <Clock3 size={18} color={colors.primary} />
        <Text style={[styles.value, !value && styles.placeholder]}>{value || '時刻を選択'}</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{label}</Text>
            <ScrollView contentContainerStyle={styles.options}>
              <Pressable onPress={() => select('')} style={[styles.option, !value && styles.optionSelected]}>
                <Text style={[styles.optionText, !value && styles.optionTextSelected]}>未設定</Text>
              </Pressable>
              {options.map((time) => {
                const selected = time === value;
                return (
                  <Pressable
                    key={time}
                    onPress={() => select(time)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{time}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeLabel}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800'
  },
  field: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  value: {
    color: colors.text,
    fontSize: 16,
    flex: 1
  },
  placeholder: {
    color: colors.textMuted
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '78%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  option: {
    width: '22%',
    minWidth: 64,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  optionTextSelected: {
    color: colors.surface
  },
  closeButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800'
  }
});

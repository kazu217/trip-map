import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
};

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const monthDays = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

export const DatePickerField = ({ label, value, onChange, optional }: DatePickerFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(() => {
    const selected = parseDateValue(value);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });
  const days = useMemo(() => monthDays(month), [month]);

  const open = () => {
    const selected = parseDateValue(value);
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setVisible(true);
  };

  const moveMonth = (amount: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectDate = (date: Date) => {
    onChange(toDateValue(date));
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={open} style={styles.field}>
        <CalendarDays size={18} color={colors.primary} />
        <Text style={[styles.value, !value && styles.placeholder]}>{value || '日付を選択'}</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.header}>
              <Pressable accessibilityLabel="前の月" onPress={() => moveMonth(-1)} style={styles.iconButton}>
                <ChevronLeft size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {month.getFullYear()}年 {month.getMonth() + 1}月
              </Text>
              <Pressable accessibilityLabel="次の月" onPress={() => moveMonth(1)} style={styles.iconButton}>
                <ChevronRight size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekdays.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.days}>
              {days.map((day) => {
                const dayValue = toDateValue(day);
                const selected = dayValue === value;
                const currentMonth = day.getMonth() === month.getMonth();
                return (
                  <Pressable
                    key={dayValue}
                    accessibilityLabel={dayValue}
                    onPress={() => selectDate(day)}
                    style={[styles.day, selected && styles.daySelected]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !currentMonth && styles.dayOutside,
                        selected && styles.dayTextSelected
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.footer}>
              {optional ? (
                <Pressable
                  onPress={() => {
                    onChange('');
                    setVisible(false);
                  }}
                  style={styles.textButton}
                >
                  <Text style={styles.textButtonLabel}>未設定</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable onPress={() => setVisible(false)} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>閉じる</Text>
              </Pressable>
            </View>
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
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  monthTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900'
  },
  weekRow: {
    flexDirection: 'row'
  },
  weekday: {
    width: `${100 / 7}%`,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800'
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm
  },
  daySelected: {
    backgroundColor: colors.primary
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  dayOutside: {
    color: colors.border
  },
  dayTextSelected: {
    color: colors.surface
  },
  footer: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textButton: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800'
  }
});

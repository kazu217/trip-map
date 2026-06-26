import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { AttachmentViewer } from './AttachmentViewer';

type AttachmentStripProps = {
  attachments: string[];
};

export const AttachmentStrip = ({ attachments }: AttachmentStripProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!attachments.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.label}>添付</Text>
        <Text style={styles.hint}>タップして拡大</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {attachments.map((uri, index) => (
          <Pressable
            accessibilityLabel={`添付画像 ${index + 1} を拡大`}
            accessibilityRole="imagebutton"
            key={`${uri}-${index}`}
            onPress={() => setSelectedIndex(index)}
            style={({ pressed }) => [styles.imageButton, pressed && styles.imagePressed]}
          >
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          </Pressable>
        ))}
      </ScrollView>
      <AttachmentViewer attachments={attachments} initialIndex={selectedIndex} onClose={() => setSelectedIndex(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800'
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12
  },
  list: {
    gap: spacing.sm
  },
  imageButton: {
    width: 118,
    height: 86,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden'
  },
  imagePressed: {
    opacity: 0.72
  },
  image: {
    width: '100%',
    height: '100%'
  }
});

import { FileText, Share2, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { formatFileSize, openFileAttachment } from '../services/fileService';
import { FileAttachment } from '../types/models';

type FileAttachmentListProps = {
  files: FileAttachment[];
  onRemove?: (id: string) => void;
};

export const FileAttachmentList = ({ files, onRemove }: FileAttachmentListProps) => {
  if (!files.length) return null;

  const open = async (file: FileAttachment) => {
    try {
      await openFileAttachment(file);
    } catch (error) {
      Alert.alert('ファイルを開けませんでした', error instanceof Error ? error.message : 'もう一度お試しください。');
    }
  };

  return (
    <View style={styles.list}>
      {files.map((file) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${file.name}を開く`}
          key={file.id}
          onPress={() => open(file)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.icon}>
            <FileText size={20} color={colors.primary} />
          </View>
          <View style={styles.text}>
            <Text numberOfLines={2} style={styles.name}>{file.name}</Text>
            <Text style={styles.meta}>{formatFileSize(file.size) || '添付ファイル'}</Text>
          </View>
          {onRemove ? (
            <Pressable
              accessibilityLabel={`${file.name}を削除`}
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onRemove(file.id);
              }}
              style={styles.action}
            >
              <Trash2 size={19} color={colors.danger} />
            </Pressable>
          ) : (
            <View style={styles.action}>
              <Share2 size={18} color={colors.textMuted} />
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  pressed: {
    opacity: 0.72
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  text: {
    flex: 1,
    gap: 3
  },
  name: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12
  },
  action: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

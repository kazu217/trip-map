import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import ImageViewing from 'react-native-image-viewing';

import { colors, spacing } from '../constants/theme';

type AttachmentViewerProps = {
  attachments: string[];
  initialIndex: number | null;
  onClose: () => void;
};

export const AttachmentViewer = ({ attachments, initialIndex, onClose }: AttachmentViewerProps) => (
  <ImageViewing
    images={attachments.map((uri) => ({ uri }))}
    imageIndex={initialIndex ?? 0}
    visible={initialIndex !== null}
    onRequestClose={onClose}
    backgroundColor="#090909"
    swipeToCloseEnabled
    doubleTapToZoomEnabled
    HeaderComponent={() => (
      <SafeAreaView pointerEvents="box-none" style={styles.header}>
        <Pressable
          accessibilityLabel="画像を閉じる"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onClose}
          style={styles.closeButton}
        >
          <X size={25} color={colors.surface} />
        </Pressable>
      </SafeAreaView>
    )}
    FooterComponent={({ imageIndex }) => (
      <View pointerEvents="none" style={styles.footer}>
        <Text style={styles.counter}>{imageIndex + 1} / {attachments.length}</Text>
        <Text style={styles.help}>ピンチまたはダブルタップで拡大</Text>
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 2,
    alignItems: 'flex-end',
    padding: spacing.md
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)'
  },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: spacing.xl,
    left: 0,
    alignItems: 'center',
    gap: spacing.xs
  },
  counter: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800'
  },
  help: {
    color: '#D6D6D6',
    fontSize: 12
  }
});

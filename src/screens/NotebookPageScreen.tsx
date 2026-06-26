import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, ImagePlus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';

import { AppButton } from '../components/AppButton';
import { AttachmentViewer } from '../components/AttachmentViewer';
import { Field } from '../components/Field';
import { colors, radius, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { ensureAnonymousUser, isFirebaseConfigured } from '../services/firebase';
import { pickAttachment, uploadAttachmentToStorage } from '../services/imageService';
import { useTripStore } from '../store/tripStore';
import { normalizeUrl } from '../utils/format';

type Props = NativeStackScreenProps<TripsStackParamList, 'NotebookPage'>;

export const NotebookPageScreen = ({ navigation, route }: Props) => {
  const { tripId, pageId } = route.params;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const page = trip?.notebookPages?.find((item) => item.id === pageId);
  const addPage = useTripStore((state) => state.addNotebookPage);
  const updatePage = useTripStore((state) => state.updateNotebookPage);
  const deletePage = useTripStore((state) => state.deleteNotebookPage);
  const [title, setTitle] = useState(page?.title || '');
  const [body, setBody] = useState(page?.body || '');
  const [linksText, setLinksText] = useState((page?.links || []).join('\n'));
  const [attachments, setAttachments] = useState<string[]>(page?.attachments || []);
  const [selectedAttachment, setSelectedAttachment] = useState<number | null>(null);

  if (!trip) {
    return <View style={styles.content}><Text style={styles.title}>旅行が見つかりません</Text></View>;
  }

  const links = linksText.split('\n').map((link) => link.trim()).filter(Boolean);

  const addAttachment = async () => {
    try {
      const uri = await pickAttachment();
      if (!uri) return;
      if (isFirebaseConfigured()) {
        const user = await ensureAnonymousUser();
        const storagePath = `users/${user.uid}/trips/${trip.id}/notebook/${Date.now()}.jpg`;
        const downloadUrl = await uploadAttachmentToStorage(uri, storagePath);
        setAttachments((current) => [...current, downloadUrl]);
        return;
      }
      setAttachments((current) => [...current, uri]);
    } catch (error) {
      Alert.alert('画像を追加できませんでした', error instanceof Error ? error.message : 'もう一度お試しください。');
    }
  };

  const save = () => {
    if (!title.trim() && !body.trim() && links.length === 0 && attachments.length === 0) {
      Alert.alert('ページが空です', 'タイトル、本文、リンク、画像のいずれかを追加してください。');
      return;
    }
    const draft = { title, body, links, attachments };
    if (pageId) updatePage(trip.id, pageId, draft);
    else addPage(trip.id, draft);
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!pageId) return;
    Alert.alert('このページを削除しますか？', '削除したページは元に戻せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          deletePage(trip.id, pageId);
          navigation.goBack();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="ページ名" value={title} onChangeText={setTitle} placeholder="例: 行きたい場所、持ち物、現地メモ" />
        <Field
          label="自由メモ"
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="文章、チェックリスト、住所などを自由に記入"
          inputProps={{ style: styles.bodyInput }}
        />
        <Field
          label="リンク集"
          value={linksText}
          onChangeText={setLinksText}
          multiline
          placeholder={'https://...\nhttps://...'}
          helper="1行に1つずつURLを入力します。"
          inputProps={{ autoCapitalize: 'none', autoCorrect: false }}
        />

        {links.length ? (
          <View style={styles.links}>
            {links.map((link) => (
              <Pressable key={link} onPress={() => Linking.openURL(normalizeUrl(link))} style={styles.linkRow}>
                <ExternalLink size={16} color={colors.primary} />
                <Text numberOfLines={1} style={styles.linkText}>{link}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>画像集</Text>
          <AppButton
            label="画像を追加"
            variant="secondary"
            icon={<ImagePlus size={18} color={colors.text} />}
            onPress={addAttachment}
          />
          {attachments.length ? (
            <View style={styles.attachments}>
              {attachments.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.attachment}>
                  <Pressable
                    accessibilityLabel={`画像 ${index + 1} を拡大`}
                    accessibilityRole="imagebutton"
                    onPress={() => setSelectedAttachment(index)}
                  >
                    <Image source={{ uri }} resizeMode="contain" style={styles.attachmentImage} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="画像を削除"
                    onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    style={styles.removeAttachment}
                  >
                    <X size={16} color={colors.surface} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <AttachmentViewer
          attachments={attachments}
          initialIndex={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />

        <AppButton label="ページを保存" onPress={save} />
        {pageId ? (
          <AppButton
            label="ページを削除"
            variant="danger"
            icon={<Trash2 size={17} color={colors.surface} />}
            onPress={confirmDelete}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900'
  },
  bodyInput: {
    minHeight: 220,
    textAlignVertical: 'top'
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  links: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden'
  },
  linkRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  linkText: {
    flex: 1,
    color: colors.primary,
    fontSize: 14
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  attachment: {
    position: 'relative'
  },
  attachmentImage: {
    width: 112,
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  removeAttachment: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

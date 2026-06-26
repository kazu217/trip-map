import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { FileAttachment } from '../types/models';
import { getFirebaseClients } from './firebase';

const attachmentDirectory = `${FileSystem.documentDirectory || ''}attachments`;

const safeFileName = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/^_+|_+$/g, '') || 'file';

const createFileId = () => `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const pickFileAttachment = async (): Promise<FileAttachment | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false
  });

  if (result.canceled || !result.assets.length) return null;

  const asset = result.assets[0];
  const id = createFileId();
  const fileName = asset.name || '添付ファイル';
  let uri = asset.uri;

  if (FileSystem.documentDirectory) {
    await FileSystem.makeDirectoryAsync(attachmentDirectory, { intermediates: true });
    const destination = `${attachmentDirectory}/${id}_${safeFileName(fileName)}`;
    await FileSystem.copyAsync({ from: asset.uri, to: destination });
    uri = destination;
  }

  return {
    id,
    name: fileName,
    uri,
    mimeType: asset.mimeType || 'application/octet-stream',
    size: asset.size || 0
  };
};

export const uploadFileAttachmentToStorage = async (
  file: FileAttachment,
  storagePath: string
): Promise<FileAttachment> => {
  const { storage } = getFirebaseClients();
  if (!storage) return file;

  const response = await fetch(file.uri);
  const blob = await response.blob();
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, blob, { contentType: file.mimeType });
  return { ...file, uri: await getDownloadURL(fileRef) };
};

export const openFileAttachment = async (file: FileAttachment) => {
  if (/^https?:\/\//i.test(file.uri)) {
    await Linking.openURL(file.uri);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('この端末ではファイルを開けません。');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: file.mimeType,
    dialogTitle: file.name,
    UTI: file.mimeType
  });
};

export const formatFileSize = (size: number) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

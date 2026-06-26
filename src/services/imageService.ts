import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getFirebaseClients } from './firebase';

export const pickAttachment = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('画像ライブラリへのアクセスが許可されていません。');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.82
  });

  if (result.canceled || !result.assets.length) return null;
  return result.assets[0].uri;
};

export const uploadAttachmentToStorage = async (uri: string, storagePath: string) => {
  const { storage } = getFirebaseClients();
  if (!storage) return uri;

  const response = await fetch(uri);
  const blob = await response.blob();
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, blob);
  return getDownloadURL(fileRef);
};

// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// A file picker component that handles both image selection and document selection.
//
// Props:
//   mode: 'image' | 'document'
//   onFilePicked: function(file) — called with the selected file object
//   existingUrl: string | null — URL of the currently stored file (shows preview)
//   label: string — label above the picker
const FileUploadPicker = ({ mode = 'image', onFilePicked, existingUrl, label }) => {
  const [pickedFile, setPickedFile] = useState(null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      setPickedFile(file);
      onFilePicked(file);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
      };
      setPickedFile(file);
      onFilePicked(file);
    }
  };

  const handlePick = () => {
    if (mode === 'image') {
      handlePickImage();
    } else {
      handlePickDocument();
    }
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(jpg|jpeg|png|gif)(\?.*)?$/i) !== null;
  };

  // Determine what to show as preview
  const imagePreviewUri = mode === 'image'
    ? (pickedFile?.uri || (existingUrl && isImageUrl(existingUrl) ? existingUrl : null))
    : null;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity style={styles.picker} onPress={handlePick}>
        {imagePreviewUri ? (
          <View>
            <Image source={{ uri: imagePreviewUri }} style={styles.imagePreview} />
            {pickedFile && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.selectedBadgeText}>Selected — tap to change</Text>
              </View>
            )}
          </View>
        ) : pickedFile ? (
          <View style={styles.selectedFile}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <Text style={styles.selectedFileName} numberOfLines={1}>{pickedFile.name}</Text>
            <Text style={styles.tapToChange}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name={mode === 'image' ? 'image-outline' : 'document-outline'}
              size={32}
              color={colors.textSecondary}
            />
            <Text style={styles.placeholderText}>
              {mode === 'image' ? 'Tap to select image' : 'Tap to select document (PDF, XLSX, DOCX)'}
            </Text>
            {existingUrl && !isImageUrl(existingUrl) && (
              <Text style={styles.existingFile} numberOfLines={1}>
                Current: {existingUrl.split('/').pop()}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  picker: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  selectedBadgeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  selectedFile: {
    padding: 20,
    alignItems: 'center',
  },
  selectedFileName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  tapToChange: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  placeholder: {
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  existingFile: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default FileUploadPicker;

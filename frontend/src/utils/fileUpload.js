import { Platform } from 'react-native';

const appendFileToFormData = async (formData, fieldName, file) => {
  if (!file) return;

  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append(fieldName, blob, file.name);
  } else {
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
  }
};

export default appendFileToFormData;

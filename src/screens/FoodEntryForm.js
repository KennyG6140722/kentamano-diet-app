import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { TextInput, Button, Card, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export default function FoodEntryForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', '写真を選択するにはメディアライブラリの権限を許可してください');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('pickImage error', error);
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', 'カメラを使うにはカメラの権限を許可してください');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('takePhoto error', error);
      Alert.alert('エラー', '写真の撮影に失敗しました');
    }
  };

  const removePhoto = () => setPhotoUri(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', '食事の名前を入力してください');
      return;
    }
    if (!calories.trim()) {
      Alert.alert('入力エラー', 'カロリーを入力してください');
      return;
    }

    setLoading(true);
    try {
      const entry = {
        name: name.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        note: note.trim(),
        photoUri,
      };

      onSubmit(entry);
      resetForm();
    } catch (error) {
      console.warn('handleSubmit error', error);
      Alert.alert('エラー', 'データの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNote('');
    setPhotoUri(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="食事の名前"
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder="例：朝食、昼食"
              style={styles.input}
            />

            <TextInput
              label="カロリー (kcal)"
              value={calories}
              onChangeText={setCalories}
              mode="outlined"
              keyboardType="numeric"
              placeholder="例：500"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="タンパク質 (g)"
                value={protein}
                onChangeText={setProtein}
                mode="outlined"
                keyboardType="numeric"
                placeholder="g"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="炭水化物 (g)"
                value={carbs}
                onChangeText={setCarbs}
                mode="outlined"
                keyboardType="numeric"
                placeholder="g"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <TextInput
              label="脂肪 (g)"
              value={fat}
              onChangeText={setFat}
              mode="outlined"
              keyboardType="numeric"
              placeholder="g"
              style={styles.input}
            />

            <TextInput
              label="メモ（任意）"
              value={note}
              onChangeText={setNote}
              mode="outlined"
              placeholder="例：塩辛かった"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.photoSection}>
              {photoUri ? (
                <View style={styles.photoContainer}>
                  <Card style={[styles.photoCard, { position: 'relative' }]}>
                    <Card.Cover source={{ uri: photoUri }} />
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={removePhoto}
                      style={styles.removePhotoButton}
                      accessibilityLabel="写真を削除"
                    />
                  </Card>
                </View>
              ) : (
                <View style={styles.photoButtonsRow}>
                  <Button
                    mode="outlined"
                    icon="image"
                    onPress={pickImage}
                    style={styles.photoButton}
                  >
                    写真を選択
                  </Button>
                  <Button
                    mode="outlined"
                    icon="camera"
                    onPress={takePhoto}
                    style={styles.photoButton}
                  >
                    写真を撮る
                  </Button>
                </View>
              )}
            </View>

            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              >
                保存
              </Button>
              <Button
                mode="outlined"
                onPress={onCancel}
                disabled={loading}
                style={styles.cancelButton}
              >
                キャンセル
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  photoSection: {
    marginVertical: 16,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoButton: {
    flex: 1,
    marginRight: 8,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photoCard: {
    overflow: 'hidden',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submitButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
  },
});

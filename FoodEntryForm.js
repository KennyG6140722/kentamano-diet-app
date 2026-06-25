import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export default function FoodEntryForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // カメラロールから画像を選択
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', '食事の名前を入力してください');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        calories: calories ? parseInt(calories) : null,
        note: note.trim(),
        photoUri,
        createdAt: new Date().toISOString(),
      });
      setName('');
      setCalories('');
      setNote('');
      setPhotoUri(null);
    } catch (error) {
      Alert.alert('エラー', 'フォーム送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* 写真プレビュー */}
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          )}

          {/* 写真ボタン */}
          <Button
            icon="camera"
            mode="outlined"
            onPress={pickImage}
            style={styles.button}
          >
            写真を選択
          </Button>

          {/* 食事名入力 */}
          <TextInput
            label="食事の名前"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="例: 朝食（卵焼きとご飯）"
          />

          {/* カロリー入力 */}
          <TextInput
            label="カロリー（kcal）"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            style={styles.input}
            placeholder="例: 500"
          />

          {/* メモ入力 */}
          <TextInput
            label="メモ"
            value={note}
            onChangeText={setNote}
            style={styles.input}
            placeholder="例: 食べ過ぎた"
            multiline
            numberOfLines={3}
          />

          {/* ボタングループ */}
          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              保存
            </Button>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              キャンセル
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { marginTop: 16 },
  input: { marginVertical: 8 },
  button: { marginVertical: 12 },
  photoPreview: { width: '100%', height: 200, marginBottom: 12, borderRadius: 8 },
  buttonGroup: { flexDirection: 'row', gap: 8, marginTop: 16 },
  submitButton: { flex: 1 },
  cancelButton: { flex: 1 },
});

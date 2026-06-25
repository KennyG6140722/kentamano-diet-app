import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { IconButton } from 'react-native-paper';

export default function FoodEntryForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // 写真を選択
  const pickImage = async () => {
    try {
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
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  // 写真を削除
  const removePhoto = () => {
    setPhotoUri(null);
  };

  // フォームを送信
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
        id: Date.now().toString(),
        name: name.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        note: note.trim(),
        photoUri,
        createdAt: new Date().toISOString(),
      };

      onSubmit(entry);
      resetForm();
    } catch (error) {
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* 食事名 */}
          <TextInput
            label="食事の名前"
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="例：朝食、昼食"
            style={styles.input}
          />

          {/* カロリー */}
          <TextInput
            label="カロリー (kcal)"
            value={calories}
            onChangeText={setCalories}
            mode="outlined"
            keyboardType="numeric"
            placeholder="例：500"
            style={styles.input}
          />

          {/* 栄養成分（タンパク質、炭水化物、脂肪） */}
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

          {/* メモ */}
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

          {/* 写真 */}
          <View style={styles.photoSection}>
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Card style={styles.photoCard}>
                  <Card.Cover source={{ uri: photoUri }} />
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={removePhoto}
                    style={styles.removePhotoButton}
                  />
                </Card>
              </View>
            ) : (
              <Button
                mode="outlined"
                icon="camera"
                onPress={pickImage}
                style={styles.photoButton}
              >
                写真を選択
              </Button>
            )}
          </View>

          {/* ボタン */}
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
  photoButton: {
    marginBottom: 12,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photoCard: {
    overflow: 'hidden',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
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

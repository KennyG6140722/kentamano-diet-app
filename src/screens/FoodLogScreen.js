import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { FAB, Appbar, Card, Paragraph, IconButton } from 'react-native-paper';
import FoodEntryForm from '../components/FoodEntryForm';
import { loadFoodEntries, saveFoodEntry, deleteFoodEntry } from '../services/storage';

export default function FoodLogScreen() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // アプリ起動時にデータを読み込む
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await loadFoodEntries();
      setEntries(savedEntries);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry) => {
    try {
      const newEntry = await saveFoodEntry(entry);
      setEntries(prev => [newEntry, ...prev]);
      setShowForm(false);
    } catch (error) {
      Alert.alert('エラー', 'データの保存に失敗しました');
    }
  };

  const handleDeleteEntry = (id) => {
    Alert.alert(
      '削除確認',
      'この記録を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFoodEntry(id);
              setEntries(prev => prev.filter(entry => entry.id !== id));
            } catch (error) {
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="食事ログ" />
      </Appbar.Header>

      {showForm ? (
        <FoodEntryForm onSubmit={addEntry} onCancel={() => setShowForm(false)} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              {item.photoUri ? <Image source={{ uri: item.photoUri }} style={styles.photo} /> : null}
              <Card.Content>
                <Paragraph style={styles.title}>{item.name}</Paragraph>
                <Paragraph>カロリー: {item.calories || '未入力'} kcal</Paragraph>
                {item.note ? <Paragraph>{item.note}</Paragraph> : null}
                <Paragraph style={styles.date}>{new Date(item.createdAt).toLocaleString('ja-JP')}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteEntry(item.id)}
                />
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={<Paragraph style={{ padding: 16 }}>まだ記録がありません。＋ボタンで追加してください。</Paragraph>}
        />
      )}

      <FAB style={styles.fab} icon="plus" onPress={() => setShowForm(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  card: { margin: 8 },
  photo: { width: '100%', height: 180 },
  title: { fontWeight: 'bold', fontSize: 16 },
  date: { fontSize: 12, color: '#999', marginTop: 8 }
});

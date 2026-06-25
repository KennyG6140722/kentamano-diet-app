import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'FOOD_ENTRIES';

/**
 * すべての食事ログを取得
 */
export async function loadFoodEntries() {
  try {
    const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonString ? JSON.parse(jsonString) : [];
  } catch (error) {
    console.error('Failed to load food entries:', error);
    return [];
  }
}

/**
 * 新しい食事ログを追加（既存データを保持）
 */
export async function saveFoodEntry(entry) {
  try {
    const entries = await loadFoodEntries();
    const newEntry = {
      ...entry,
      id: Date.now().toString(), // ユニークIDを自動生成
    };
    const updatedEntries = [newEntry, ...entries];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return newEntry;
  } catch (error) {
    console.error('Failed to save food entry:', error);
    throw error;
  }
}

/**
 * すべてのデータを削除（デバッグ用）
 */
export async function clearAllEntries() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear entries:', error);
  }
}

/**
 * IDで食事ログを削除
 */
export async function deleteFoodEntry(id) {
  try {
    const entries = await loadFoodEntries();
    const filtered = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw error;
  }
}

/**
 * IDで食事ログを更新
 */
export async function updateFoodEntry(id, updates) {
  try {
    const entries = await loadFoodEntries();
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update entry:', error);
    throw error;
  }
}

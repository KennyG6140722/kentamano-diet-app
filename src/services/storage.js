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

/**
 * 指定された日付の食事記録を取得する
 * @param {Date} date - 対象日付
 * @returns {Promise<Array>} その日の食事記録
 */
export async function getFoodEntriesByDate(date) {
  try {
    const entries = await loadFoodEntries();
    const targetDate = new Date(date).toDateString();
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt).toDateString();
      return entryDate === targetDate;
    });
  } catch (error) {
    console.error('Failed to get food entries by date:', error);
    return [];
  }
}

/**
 * 指定された日付の栄養合計を計算する
 * @param {Date} date - 対象日付
 * @returns {Promise<Object>} 栄養合計
 */
export async function getDailySummary(date) {
  try {
    const entries = await getFoodEntriesByDate(date);
    
    const summary = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0),
        count: acc.count + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
    
    return summary;
  } catch (error) {
    console.error('Failed to get daily summary:', error);
    return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
  }
}

/**
 * 指定された期間の栄養データを取得する
 * @param {Date} startDate - 開始日
 * @param {Date} endDate - 終了日
 * @returns {Promise<Array>} 期間内の食事記録
 */
export async function getFoodEntriesByDateRange(startDate, endDate) {
  try {
    const entries = await loadFoodEntries();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return entries.filter(entry => {
      const entryTime = new Date(entry.createdAt).getTime();
      return entryTime >= start && entryTime <= end;
    });
  } catch (error) {
    console.error('Failed to get food entries by date range:', error);
    return [];
  }
}

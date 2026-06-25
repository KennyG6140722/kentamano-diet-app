import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kentamano_food_entries';

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export async function loadFoodEntries() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('loadFoodEntries error', e);
    throw e;
  }
}

export async function saveFoodEntry(entry) {
  try {
    const entries = await loadFoodEntries();
    const now = new Date().toISOString();
    const newEntry = {
      id: genId(),
      createdAt: now,
      ...entry
    };
    const newEntries = [newEntry, ...entries];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    return newEntry;
  } catch (e) {
    console.warn('saveFoodEntry error', e);
    throw e;
  }
}

export async function deleteFoodEntry(id) {
  try {
    const entries = await loadFoodEntries();
    const filtered = entries.filter(e => String(e.id) !== String(id));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.warn('deleteFoodEntry error', e);
    throw e;
  }
}

export async function clearAllEntries() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('clearAllEntries error', e);
    throw e;
  }
}

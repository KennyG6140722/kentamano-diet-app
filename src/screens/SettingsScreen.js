import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Paragraph, Divider, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllEntries } from '../services/storage';

const SETTINGS_KEY = 'diet_app_settings';

const DEFAULT_SETTINGS = {
  calorieGoal: 2000,
  proteinGoal: 50,
  carbsGoal: 250,
  fatGoal: 65,
  userName: '',
  height: '',
  weight: '',
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // 設定を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      // 数値の検証
      if (
        parseInt(settings.calorieGoal) <= 0 ||
        parseInt(settings.proteinGoal) <= 0 ||
        parseInt(settings.carbsGoal) <= 0 ||
        parseInt(settings.fatGoal) <= 0
      ) {
        Alert.alert('入力エラー', '目標値は0より大きい値を入力してください');
        return;
      }

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setHasChanges(false);
      Alert.alert('成功', '設定を保存しました');
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました');
      console.error('Failed to save settings:', error);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      '設定をリセット',
      'デフォルト値にリセットしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            setSettings(DEFAULT_SETTINGS);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      '全記録削除',
      '保存されているすべての食事記録を削除します。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllEntries();
              Alert.alert('成功', 'すべての記録を削除しました');
            } catch (error) {
              Alert.alert('エラー', '削除に失敗しました');
              console.error('Failed to clear data:', error);
            }
          },
        },
      ]
    );
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Paragraph>読み込み中...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Paragraph style={styles.headerTitle}>設定</Paragraph>
      </View>

      {/* プロフィール情報 */}
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.cardTitle}>プロフィール</Paragraph>
          <TextInput
            label="ユーザー名（任意）"
            value={settings.userName}
            onChangeText={(value) => handleSettingChange('userName', value)}
            mode="outlined"
            placeholder="例：太郎"
            style={styles.input}
          />
          <TextInput
            label="身長 (cm)"
            value={settings.height}
            onChangeText={(value) => handleSettingChange('height', value)}
            mode="outlined"
            keyboardType="numeric"
            placeholder="例：170"
            style={styles.input}
          />
          <TextInput
            label="体重 (kg)"
            value={settings.weight}
            onChangeText={(value) => handleSettingChange('weight', value)}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="例：70.5"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* 栄養目標設定 */}
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.cardTitle}>1日の栄養目標</Paragraph>
          <TextInput
            label="カロリー目標 (kcal)"
            value={settings.calorieGoal.toString()}
            onChangeText={(value) => handleSettingChange('calorieGoal', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="タンパク質目標 (g)"
            value={settings.proteinGoal.toString()}
            onChangeText={(value) => handleSettingChange('proteinGoal', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="炭水化物目標 (g)"
            value={settings.carbsGoal.toString()}
            onChangeText={(value) => handleSettingChange('carbsGoal', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="脂肪目標 (g)"
            value={settings.fatGoal.toString()}
            onChangeText={(value) => handleSettingChange('fatGoal', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* 栄養目標の推奨値 */}
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.cardTitle}>推奨値（参考）</Paragraph>
          <Paragraph style={styles.recommendText}>
            • カロリー: 2000 kcal（成人）
          </Paragraph>
          <Paragraph style={styles.recommendText}>
            • タンパク質: 体重(kg) × 1.2～2g
          </Paragraph>
          <Paragraph style={styles.recommendText}>
            • 炭水化物: 総カロリーの50～60%
          </Paragraph>
          <Paragraph style={styles.recommendText}>
            • 脂肪: 総カロリーの20～35%
          </Paragraph>
        </Card.Content>
      </Card>

      {/* アクション */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              onPress={saveSettings}
              disabled={!hasChanges}
              style={styles.button}
            >
              設定を保存
            </Button>
            <Button
              mode="outlined"
              onPress={resetSettings}
              style={styles.button}
            >
              デフォルトにリセット
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* 危険ゾーン */}
      <Card style={styles.dangerCard}>
        <Card.Content>
          <Paragraph style={styles.dangerTitle}>危険ゾーン</Paragraph>
          <Divider style={styles.divider} />
          <Paragraph style={styles.dangerText}>
            すべての食事記録を削除します。この操作は取り消せません。
          </Paragraph>
          <Button
            mode="contained"
            buttonColor="#e74c3c"
            onPress={clearAllData}
            style={styles.dangerButton}
          >
            全記録を削除
          </Button>
        </Card.Content>
      </Card>

      {/* バージョン情報 */}
      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          Kentamano Diet App v1.0.0
        </Paragraph>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  recommendText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  buttonGroup: {
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
  dangerCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  dangerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  dangerButton: {
    marginTop: 8,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

import React, { useState, useEffect, useFocusEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Card, Paragraph, ProgressBar, Appbar, Button, FAB } from 'react-native-paper';
import { getDailySummary, getFoodEntriesByDate } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const [summary, setSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    count: 0,
  });
  const [todayEntries, setTodayEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 目標値（ユーザーがカスタマイズ可能）
  const CALORIE_GOAL = 2000;
  const PROTEIN_GOAL = 50;
  const CARBS_GOAL = 250;
  const FAT_GOAL = 65;

  // 画面がフォーカスされた時にデータを更新
  useFocusEffect(
    React.useCallback(() => {
      loadTodayData();
    }, [])
  );

  // 初回マウント時にデータを読み込む
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const dailySummary = await getDailySummary(today);
      const entries = await getFoodEntriesByDate(today);
      
      setSummary(dailySummary);
      setTodayEntries(entries);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayData();
    setRefreshing(false);
  };

  // プログレスバーの値を計算（0-1の範囲）
  const getProgressValue = (current, goal) => {
    const value = current / goal;
    return value > 1 ? 1 : value;
  };

  // 進捗状況の色を返す
  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return '#e74c3c'; // 赤: 超過
    if (percentage >= 80) return '#f39c12'; // オレンジ: ほぼ達成
    return '#27ae60'; // 緑: 達成中
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="ホーム" />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={todayEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 今日の日付 */}
            <Paragraph style={styles.dateText}>
              {new Date().toLocaleDateString('ja-JP', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Paragraph>

            {/* カロリーサマリー */}
            <Card style={styles.card}>
              <Card.Content>
                <Paragraph style={styles.cardTitle}>カロリー</Paragraph>
                <View style={styles.summaryRow}>
                  <Paragraph style={styles.summaryValue}>
                    {summary.calories} kcal
                  </Paragraph>
                  <Paragraph style={styles.goalText}>
                    目標: {CALORIE_GOAL} kcal
                  </Paragraph>
                </View>
                <ProgressBar
                  progress={getProgressValue(summary.calories, CALORIE_GOAL)}
                  color={getProgressColor(summary.calories, CALORIE_GOAL)}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {/* 栄養成分 */}
            <Card style={styles.card}>
              <Card.Content>
                <Paragraph style={styles.cardTitle}>栄養成分</Paragraph>

                {/* タンパク質 */}
                <View style={styles.nutrientContainer}>
                  <Paragraph style={styles.nutrientLabel}>
                    タンパク質: {summary.protein}g / {PROTEIN_GOAL}g
                  </Paragraph>
                  <ProgressBar
                    progress={getProgressValue(summary.protein, PROTEIN_GOAL)}
                    color={getProgressColor(summary.protein, PROTEIN_GOAL)}
                    style={styles.progressBar}
                  />
                </View>

                {/* 炭水化物 */}
                <View style={styles.nutrientContainer}>
                  <Paragraph style={styles.nutrientLabel}>
                    炭水化物: {summary.carbs}g / {CARBS_GOAL}g
                  </Paragraph>
                  <ProgressBar
                    progress={getProgressValue(summary.carbs, CARBS_GOAL)}
                    color={getProgressColor(summary.carbs, CARBS_GOAL)}
                    style={styles.progressBar}
                  />
                </View>

                {/* 脂肪 */}
                <View style={styles.nutrientContainer}>
                  <Paragraph style={styles.nutrientLabel}>
                    脂肪: {summary.fat}g / {FAT_GOAL}g
                  </Paragraph>
                  <ProgressBar
                    progress={getProgressValue(summary.fat, FAT_GOAL)}
                    color={getProgressColor(summary.fat, FAT_GOAL)}
                    style={styles.progressBar}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* 本日の食事 */}
            <Paragraph style={styles.sectionTitle}>
              本日の食事 ({summary.count}件)
            </Paragraph>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.foodCard}>
            <Card.Content>
              <Paragraph style={styles.foodName}>{item.name}</Paragraph>
              <View style={styles.foodDetails}>
                <Paragraph style={styles.foodInfo}>
                  {item.calories} kcal
                </Paragraph>
                <Paragraph style={styles.foodTime}>
                  {new Date(item.createdAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Paragraph>
              </View>
              {item.note && (
                <Paragraph style={styles.foodNote}>{item.note}</Paragraph>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              今日はまだ記録がありません
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('FoodLog')}
              style={styles.emptyButton}
            >
              食事を追加
            </Button>
          </View>
        }
        style={styles.list}
      />

      {/* FAB: 食事追加ボタン */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('FoodLog')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: '500',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  goalText: {
    fontSize: 12,
    color: '#999',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  nutrientContainer: {
    marginBottom: 12,
  },
  nutrientLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 12,
    paddingHorizontal: 8,
    color: '#333',
  },
  foodCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  foodName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodInfo: {
    fontSize: 12,
    color: '#666',
  },
  foodTime: {
    fontSize: 12,
    color: '#999',
  },
  foodNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

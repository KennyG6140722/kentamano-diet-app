import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl, Alert } from 'react-native';
import { Card, Paragraph, Button, SegmentedButtons } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getFoodEntriesByDateRange, getDailySummary } from '../services/storage';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const [period, setPeriod] = useState('week'); // week, month, custom
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [pfcData, setPfcData] = useState([]);
  const [stats, setStats] = useState({
    avgCalories: 0,
    maxCalories: 0,
    minCalories: 0,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    // period が変わった時のみリロード
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      if (period === 'week') {
        await loadWeekData();
      } else if (period === 'month') {
        await loadMonthData();
      }
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekData = async () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const entries = await getFoodEntriesByDateRange(weekAgo, today);
    const days = [];
    const caloriesData = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let maxCal = 0;
    let minCal = Infinity;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const summary = await getDailySummary(date);
      
      days.push(date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }));
      caloriesData.push(summary.calories);
      
      totalCalories += summary.calories;
      totalProtein += summary.protein;
      totalCarbs += summary.carbs;
      totalFat += summary.fat;
      
      maxCal = Math.max(maxCal, summary.calories);
      minCal = Math.min(minCal, summary.calories);
    }

    const daysWithData = caloriesData.filter(cal => cal > 0).length;

    setWeekData({
      labels: days,
      datasets: [
        {
          data: caloriesData.length > 0 ? caloriesData : [0],
        },
      ],
    });

    setPfcData([
      {
        name: 'タンパク質',
        calories: totalProtein * 4,
        color: '#FF6B6B',
        legendFontColor: '#333',
      },
      {
        name: '炭水化物',
        calories: totalCarbs * 4,
        color: '#4ECDC4',
        legendFontColor: '#333',
      },
      {
        name: '脂肪',
        calories: totalFat * 9,
        color: '#FFE66D',
        legendFontColor: '#333',
      },
    ]);

    setStats({
      avgCalories: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0,
      maxCalories: maxCal || 0,
      minCalories: minCal === Infinity ? 0 : minCal,
      totalDays: daysWithData,
    });
  };

  const loadMonthData = async () => {
    const today = new Date();
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const entries = await getFoodEntriesByDateRange(monthAgo, today);
    const weeks = [];
    const caloriesData = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let maxCal = 0;
    let minCal = Infinity;

    const daysInRange = Math.ceil((today - monthAgo) / (1000 * 60 * 60 * 24));
    const weeks_count = Math.ceil(daysInRange / 7);

    for (let w = 0; w < weeks_count; w++) {
      const weekStart = new Date(monthAgo.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      let weekCalories = 0;
      let weekProtein = 0;
      let weekCarbs = 0;
      let weekFat = 0;

      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart.getTime() + d * 24 * 60 * 60 * 1000);
        if (date <= today) {
          const summary = await getDailySummary(date);
          weekCalories += summary.calories;
          weekProtein += summary.protein;
          weekCarbs += summary.carbs;
          weekFat += summary.fat;
        }
      }

      weeks.push(`W${w + 1}`);
      caloriesData.push(Math.round(weekCalories / 7)); // 平均

      totalCalories += weekCalories;
      totalProtein += weekProtein;
      totalCarbs += weekCarbs;
      totalFat += weekFat;

      maxCal = Math.max(maxCal, weekCalories);
      minCal = Math.min(minCal, weekCalories);
    }

    setMonthData({
      labels: weeks,
      datasets: [
        {
          data: caloriesData.length > 0 ? caloriesData : [0],
        },
      ],
    });

    setPfcData([
      {
        name: 'タンパク質',
        calories: totalProtein * 4,
        color: '#FF6B6B',
        legendFontColor: '#333',
      },
      {
        name: '炭水化物',
        calories: totalCarbs * 4,
        color: '#4ECDC4',
        legendFontColor: '#333',
      },
      {
        name: '脂肪',
        calories: totalFat * 9,
        color: '#FFE66D',
        legendFontColor: '#333',
      },
    ]);

    setStats({
      avgCalories: weeks_count > 0 ? Math.round(totalCalories / (weeks_count * 7)) : 0,
      maxCalories: maxCal || 0,
      minCalories: minCal === Infinity ? 0 : minCal,
      totalDays: weeks_count,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const chartData = period === 'week' ? weekData : monthData;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 期間選択 */}
      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={period}
            onValueChange={setPeriod}
            buttons={[
              { value: 'week', label: '週間' },
              { value: 'month', label: '月間' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* 統計サマリー */}
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.cardTitle}>統計情報</Paragraph>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>平均カロリー</Paragraph>
              <Paragraph style={styles.statValue}>{stats.avgCalories}</Paragraph>
              <Paragraph style={styles.statUnit}>kcal/日</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>最高カロリー</Paragraph>
              <Paragraph style={styles.statValue}>{stats.maxCalories}</Paragraph>
              <Paragraph style={styles.statUnit}>kcal</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>最低カロリー</Paragraph>
              <Paragraph style={styles.statValue}>{stats.minCalories}</Paragraph>
              <Paragraph style={styles.statUnit}>kcal</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>記録日数</Paragraph>
              <Paragraph style={styles.statValue}>{stats.totalDays}</Paragraph>
              <Paragraph style={styles.statUnit}>日</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* カロリー推移グラフ */}
      {chartData.datasets && chartData.datasets[0].data.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.cardTitle}>
              カロリー推移（{period === 'week' ? '週間' : '月間'}）
            </Paragraph>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: () => '#27ae60',
                strokeWidth: 2,
                barPercentage: 0.5,
                useShadowColorFromDataset: false,
              }}
              style={styles.chart}
              withDots={true}
              withInnerLines={true}
            />
          </Card.Content>
        </Card>
      )}

      {/* PFC バランス */}
      {pfcData.length > 0 && pfcData.some(item => item.calories > 0) && (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.cardTitle}>栄養バランス</Paragraph>
            <PieChart
              data={pfcData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: () => '#333',
              }}
              accessor="calories"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </Card.Content>
        </Card>
      )}

      {/* データなし表示 */}
      {(!chartData.datasets || chartData.datasets[0].data.every(val => val === 0)) && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph style={styles.emptyText}>
              {period === 'week' ? '今週' : '今月'}のデータがまだありません
            </Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  statUnit: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

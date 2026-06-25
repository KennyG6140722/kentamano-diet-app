import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import Illustration from './Illustration';

export default function EmptyState({ onAddPress, onSamplePress }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/empty-illustration.png')}
        style={styles.illustration}
        resizeMode="contain"
        accessible
        accessibilityLabel="空の食事記録のイラスト"
      />
      <Text style={styles.title}>まだ記録がありません</Text>
      <Text style={styles.subtitle}>
        写真を撮るか、手入力で食事を記録してみましょう。続けるほど習慣になります。
      </Text>

      <View style={styles.actions}>
        <Button mode="contained" onPress={onAddPress} style={styles.primary}>
          記録を追加する
        </Button>

        <TouchableOpacity onPress={onSamplePress} style={styles.link}>
          <Text style={styles.linkText}>サンプルを挿入して試す</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  illustration: { width: 220, height: 160, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  actions: { width: '100%', alignItems: 'center' },
  primary: { width: '70%', marginBottom: 12 },
  link: { padding: 8 },
  linkText: { color: '#007AFF', fontSize: 14 }
});

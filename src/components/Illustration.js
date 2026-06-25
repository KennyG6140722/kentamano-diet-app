import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function Illustration({ style, accessibilityLabel }) {
  const [error, setError] = useState(false);
  const local = require('../assets/empty-illustration.png');

  if (error) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>イラストを読み込めませんでした</Text>
      </View>
    );
  }

  return (
    <Image
      source={local}
      style={[styles.illustration, style]}
      resizeMode="contain"
      onError={() => setError(true)}
      accessible
      accessibilityLabel={accessibilityLabel || '空の食事記録のイラスト'}
    />
  );
}

const styles = StyleSheet.create({
  illustration: { width: 220, height: 160 },
  fallbackContainer: { width: 220, height: 160, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#666', textAlign: 'center' }
});


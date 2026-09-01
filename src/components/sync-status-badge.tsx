import { View, Text, StyleSheet } from 'react-native';

interface SyncStatusBadgeProps {
  isPending: boolean;
}

export function SyncStatusBadge({ isPending }: SyncStatusBadgeProps) {
  if (!isPending) {
    return (
      <View style={styles.synced}>
        <Text style={styles.syncedText}>✓</Text>
      </View>
    );
  }

  return (
    <View style={styles.pending}>
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  synced: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncedText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  pending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f59e0b',
  },
});

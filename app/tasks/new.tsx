import { View, Text, StyleSheet } from 'react-native';

export default function NewTaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>New task form coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
  },
});

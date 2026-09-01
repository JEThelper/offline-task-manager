import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { TaskForm } from '@/src/components/task-form';
import type { TaskInput } from '@/src/domain/task';
import { useTaskStore } from '@/src/store/task-store';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const tasks = useTaskStore((s) => s.tasks);
  const editTask = useTaskStore((s) => s.editTask);

  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    navigation.setOptions({ title: task ? 'Edit Task' : 'Task' });
  }, [navigation, task]);

  async function handleSubmit(input: TaskInput) {
    if (!id) return;
    await editTask(id, input);
    router.back();
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Task not found</Text>
      </View>
    );
  }

  return (
    <TaskForm
      initialValues={{
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
      }}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: 16,
    color: '#6b7280',
  },
});

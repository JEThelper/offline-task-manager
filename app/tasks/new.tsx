import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { TaskForm } from '@/src/components/task-form';
import type { TaskInput } from '@/src/domain/task';
import { useTaskStore } from '@/src/store/task-store';

export default function NewTaskScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const addTask = useTaskStore((s) => s.addTask);

  useEffect(() => {
    navigation.setOptions({ title: 'New Task' });
  }, [navigation]);

  async function handleSubmit(input: TaskInput) {
    await addTask(input);
    router.back();
  }

  return <TaskForm onSubmit={handleSubmit} submitLabel="Create Task" />;
}

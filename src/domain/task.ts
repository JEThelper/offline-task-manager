import { z } from 'zod';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const taskInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: 'Due date must be a valid future date' },
  ),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

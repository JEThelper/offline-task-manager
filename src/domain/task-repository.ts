import type { Task, TaskInput } from './task';

export type SortField = 'dueDate' | 'priority';
export type PriorityFilter = 'low' | 'medium' | 'high';

export interface ITaskRepository {
  getAll(sort?: SortField, filter?: PriorityFilter): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, changes: Partial<TaskInput>): Promise<Task>;
  delete(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Task>;
}

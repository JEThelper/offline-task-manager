import { create } from 'zustand';

import { SqliteSyncQueueRepository } from '../data/sqlite-sync-queue-repository';
import { SqliteTaskRepository } from '../data/sqlite-task-repository';
import type { ISyncQueueRepository } from '../domain/sync-queue-repository';
import type { Task, TaskInput } from '../domain/task';
import type { ITaskRepository, PriorityFilter, SortField } from '../domain/task-repository';
import { SyncQueueManager } from '../services/sync-queue';

const MAX_SYNC_ATTEMPTS = 5;

const taskRepo: ITaskRepository = SqliteTaskRepository;
const syncRepo: ISyncQueueRepository = SqliteSyncQueueRepository;
const syncManager = new SyncQueueManager(taskRepo, syncRepo);

interface TaskState {
  tasks: Task[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  sortBy: SortField | undefined;
  filterBy: PriorityFilter | undefined;
  unsyncedIds: Set<string>;

  loadTasks: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<void>;
  editTask: (id: string, changes: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  flushSync: () => Promise<void>;
  setSortBy: (sort: SortField | undefined) => void;
  setFilterBy: (filter: PriorityFilter | undefined) => void;
}

async function detectUnsynced(): Promise<Set<string>> {
  const queued = await syncRepo.getAll();
  const ids = new Set<string>();
  for (const entry of queued) {
    if (entry.attempts >= MAX_SYNC_ATTEMPTS) {
      const task = JSON.parse(entry.payload) as Task;
      ids.add(task.id);
    }
  }
  return ids;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  syncing: false,
  error: null,
  sortBy: undefined,
  filterBy: undefined,
  unsyncedIds: new Set(),

  async loadTasks() {
    set({ loading: true, error: null });
    try {
      const { sortBy, filterBy } = get();
      const tasks = await taskRepo.getAll(sortBy, filterBy);
      const unsyncedIds = await detectUnsynced();
      set({ tasks, unsyncedIds, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  async addTask(input) {
    const optimistic: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? '',
      priority: input.priority,
      dueDate: input.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ tasks: [optimistic, ...state.tasks] }));

    try {
      const saved = await taskRepo.create(input);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === optimistic.id ? saved : t)),
      }));
      await syncManager.handleMutation(saved, 'create');
    } catch (e) {
      set({ error: String(e) });
    }
  },

  async editTask(id, changes) {
    const { tasks } = get();
    const previous = tasks.find((t) => t.id === id);
    if (!previous) return;

    const optimistic = { ...previous, ...changes, updatedAt: new Date().toISOString() };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? optimistic : t)),
    }));

    try {
      const saved = await taskRepo.update(id, changes);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? saved : t)),
      }));
      await syncManager.handleMutation(saved, 'update');
    } catch (e) {
      set({ error: String(e) });
    }
  },

  async deleteTask(id) {
    const { tasks } = get();
    const previous = tasks.find((t) => t.id === id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

    try {
      await taskRepo.delete(id);
      if (previous) {
        await syncManager.handleMutation(previous, 'delete');
      }
    } catch (e) {
      set({ error: String(e) });
    }
  },

  async toggleTask(id) {
    const { tasks } = get();
    const previous = tasks.find((t) => t.id === id);
    if (!previous) return;

    const optimistic = {
      ...previous,
      completed: !previous.completed,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? optimistic : t)),
    }));

    try {
      const saved = await taskRepo.toggleComplete(id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? saved : t)),
      }));
      await syncManager.handleMutation(saved, 'toggle');
    } catch (e) {
      set({ error: String(e) });
    }
  },

  async flushSync() {
    set({ syncing: true });
    try {
      await syncManager.flush();
    } finally {
      set({ syncing: false });
      await get().loadTasks();
    }
  },

  setSortBy(sort) {
    set({ sortBy: sort });
  },

  setFilterBy(filter) {
    set({ filterBy: filter });
  },
}));

export { syncManager };

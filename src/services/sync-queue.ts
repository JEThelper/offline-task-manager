import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';

import type { ISyncQueueRepository, SyncOperation } from '../domain/sync-queue-repository';
import type { Task } from '../domain/task';
import type { ITaskRepository } from '../domain/task-repository';

import { createTaskRemote, updateTaskRemote, deleteTaskRemote } from './mock-api';

export class SyncQueueManager {
  private taskRepo: ITaskRepository;
  private syncRepo: ISyncQueueRepository;
  private flushing = false;
  private unsubscribe: (() => void) | null = null;

  constructor(taskRepo: ITaskRepository, syncRepo: ISyncQueueRepository) {
    this.taskRepo = taskRepo;
    this.syncRepo = syncRepo;
  }

  async startListening(): Promise<void> {
    const state = await getNetworkStateAsync();
    if (state.isConnected) {
      await this.flush();
    }

    this.unsubscribe = addNetworkStateListener(async (event) => {
      if (event.isConnected) {
        await this.flush();
      }
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async enqueueOnOffline(operation: SyncOperation, payload: string): Promise<void> {
    await this.syncRepo.add(operation, payload);
  }

  async handleMutation(task: Task, operation: SyncOperation): Promise<void> {
    const state = await getNetworkStateAsync();
    if (state.isConnected) {
      try {
        await this.executeRemote(task, operation);
        return;
      } catch {
        // Network available but call failed — queue for retry
      }
    }
    await this.syncRepo.add(operation, JSON.stringify(task));
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;

    try {
      const queued = await this.syncRepo.getAll();
      for (const entry of queued) {
        const task: Task = JSON.parse(entry.payload) as Task;
        try {
          await this.executeRemote(task, entry.operation);
          await this.syncRepo.remove(entry.id);
        } catch {
          await this.syncRepo.incrementAttempts(entry.id);
          // Backoff/retry strategy would go here in production.
          // For now we leave it in the queue for the next flush cycle.
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  private async executeRemote(task: Task, operation: SyncOperation): Promise<void> {
    switch (operation) {
      case 'create':
        await createTaskRemote(task);
        break;
      case 'update':
      case 'toggle':
        await updateTaskRemote(task);
        break;
      case 'delete':
        await deleteTaskRemote(task.id);
        break;
    }
  }
}

export type SyncOperation = 'create' | 'update' | 'delete' | 'toggle';

export interface QueuedOperation {
  id: string;
  operation: SyncOperation;
  payload: string;
  createdAt: string;
  attempts: number;
}

export interface ISyncQueueRepository {
  getAll(): Promise<QueuedOperation[]>;
  add(operation: SyncOperation, payload: string): Promise<QueuedOperation>;
  remove(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
}

export const CREATE_TASKS_TABLE = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  dueDate TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`;

export const CREATE_SYNC_QUEUE_TABLE = `
-- Mutations are queued as discrete operations rather than full task snapshots
-- because: (1) payloads stay small — a toggle is a few bytes vs. a full row,
-- (2) conflict resolution can operate on individual fields without replaying
-- an entire object, and (3) replay order is straightforward — each operation
-- is self-contained and idempotent.
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'toggle')),
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
`;

export const CREATE_TASKS_DUE_DATE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks (dueDate);
`;

export const CREATE_TASKS_PRIORITY_INDEX = `
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority);
`;

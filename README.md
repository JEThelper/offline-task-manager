# Offline Task Manager

A React Native task management app built with Expo SDK 57, designed to work fully offline with background sync when connectivity returns. Tasks persist in SQLite locally, and an operation queue handles remote sync with retry logic. The UI stays responsive through optimistic state updates — mutations reflect immediately in the list before the network round-trip completes.

## Setup

```bash
npm install
```

**Development build required** — this project uses `expo-sqlite` and `expo-network`, which are not supported in Expo Go. Create a development build:

```bash
# iOS (requires macOS)
npx expo run:android

# Or via EAS
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

Once installed on device/simulator:

```bash
npx expo start --dev-client
```

**Running tests:**

```bash
npm test
```

**Type checking and linting:**

```bash
npm run typecheck
npm run lint
```

## Feature Checklist

| Requirement | Status |
|---|---|
| Create, edit, delete tasks | Implemented — form uses Zod validation with inline errors |
| Task fields: title, description, priority, due date, completed | Implemented — all fields stored in SQLite |
| Priority levels (low, medium, high) | Implemented — segmented control in form, colored badges in list |
| Sort by due date / priority | Implemented — SQL-level ORDER BY, not in-memory |
| Filter by priority | Implemented — SQL-level WHERE clause |
| Offline persistence | Implemented — expo-sqlite, all mutations persist locally first |
| Background sync queue | Implemented — FIFO queue with attempt tracking, retries on next flush |
| Connectivity indicator | Implemented — thin bar (offline/syncing), not a blocking modal |
| Pull-to-refresh | Implemented — triggers sync flush then reloads from repository |
| Optimistic UI updates | Implemented — local state updates immediately, sync happens async |
| 500+ tasks performance | Implemented — FlashList v2, indexed sort/filter columns |
| Native date picker | Implemented — @react-native-community/datetimepicker |
| Confirmation before delete | Implemented — Alert.alert with destructive action |
| Per-task sync status badge | Implemented — green checkmark (synced) or amber dot (pending) |

## Testing Offline Behavior

To manually verify the offline sync and status indicators:

1. Enable Airplane Mode on your device
2. Create a new task — it appears in the list immediately (optimistic UI)
3. Observe the amber dot badge next to the task, indicating it's pending sync
4. Edit, toggle, or delete the task — the badge stays amber
5. Disable Airplane Mode
6. Within a few seconds, the amber dots transition to green checkmarks as the queue flushes
7. Pull down to refresh — this forces an immediate sync flush and reloads tasks

This turns an invisible background mechanism into something you can verify hands-on in under a minute without reading any code.

## Architecture

### Repository Pattern

The app uses `ITaskRepository` and `ISyncQueueRepository` as pure interfaces with no knowledge of SQLite. `SqliteTaskRepository` implements `ITaskRepository` using expo-sqlite. Screens and the Zustand store depend only on the interfaces — never on `expo-sqlite` directly.

This is dependency inversion. The persistence layer is swappable: the same in-memory implementations used in tests could replace SQLite for a web version or any other backend. It also means the store and UI can be tested with lightweight fakes instead of a real database.

### Sync Queue

When a mutation happens while offline (or the remote call fails), the operation is queued as a discrete entry in the `sync_queue` table — not a full task snapshot. Each entry stores the operation type (`create`, `update`, `delete`, `toggle`) and a JSON payload.

Operations are queued rather than snapshots because: payloads stay small (a toggle is a few bytes vs. a full row), conflict resolution can target individual fields, and replay order is straightforward since each operation is self-contained.

`SyncQueueManager.flush()` processes the queue in FIFO order. On success, the entry is removed. On failure, the attempt count increments and it stays queued for the next flush cycle. The queue is flushed automatically when connectivity is restored (via `expo-network` listener) and manually on pull-to-refresh.

### What I'd Change With More Time

Exponential backoff on retries — currently attempts increment but there's no delay scaling, so a persistently failing endpoint gets hammered. Conflict resolution for concurrent edits — if two devices edit the same task offline, the last write wins, which is wrong. A proper CRDT or field-level merge strategy would be needed. The background sync when the app is fully killed (not just backgrounded) was not attempted — that would require expo-task-manager and platform-specific background fetch configuration.

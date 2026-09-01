import type { ITaskRepository } from '../domain/task-repository';

import { createInMemoryTaskRepository } from './in-memory-task-repository';

function makeInput(
  overrides: { title?: string; priority?: 'low' | 'medium' | 'high'; dueDate?: string } = {},
) {
  return {
    title: overrides.title ?? 'Test task',
    priority: overrides.priority ?? 'medium',
    dueDate: overrides.dueDate ?? new Date(Date.now() + 86400000).toISOString(),
  };
}

let repo: ITaskRepository;

beforeEach(() => {
  repo = createInMemoryTaskRepository();
});

describe('create and getById', () => {
  it('creates a task and retrieves it by id', async () => {
    const input = makeInput({ title: 'Buy groceries' });
    const created = await repo.create(input);

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Buy groceries');
    expect(created.completed).toBe(false);

    const fetched = await repo.getById(created.id);
    expect(fetched?.id).toBe(created.id);
  });
});

describe('update', () => {
  it('updates fields and returns the merged task', async () => {
    const created = await repo.create(makeInput({ title: 'Original' }));
    const updated = await repo.update(created.id, { title: 'Updated', priority: 'high' });

    expect(updated.title).toBe('Updated');
    expect(updated.priority).toBe('high');
    expect(updated.id).toBe(created.id);
  });
});

describe('delete', () => {
  it('removes the task so getById returns null', async () => {
    const created = await repo.create(makeInput());
    await repo.delete(created.id);
    const fetched = await repo.getById(created.id);
    expect(fetched).toBeNull();
  });
});

describe('toggleComplete', () => {
  it('flips completed from false to true', async () => {
    const created = await repo.create(makeInput());
    expect(created.completed).toBe(false);

    const toggled = await repo.toggleComplete(created.id);
    expect(toggled.completed).toBe(true);
  });
});

describe('getAll with sort and filter', () => {
  it('filters by priority', async () => {
    await repo.create(makeInput({ title: 'High', priority: 'high' }));
    await repo.create(makeInput({ title: 'Low', priority: 'low' }));
    await repo.create(makeInput({ title: 'Another high', priority: 'high' }));

    const highTasks = await repo.getAll(undefined, 'high');
    expect(highTasks).toHaveLength(2);
    expect(highTasks.every((t) => t.priority === 'high')).toBe(true);
  });

  it('sorts by dueDate ascending', async () => {
    await repo.create(makeInput({ title: 'Later', dueDate: '2027-06-01T00:00:00.000Z' }));
    await repo.create(makeInput({ title: 'Sooner', dueDate: '2026-01-01T00:00:00.000Z' }));

    const sorted = await repo.getAll('dueDate');
    expect(sorted[0]?.title).toBe('Sooner');
    expect(sorted[1]?.title).toBe('Later');
  });

  it('sorts by priority with high first', async () => {
    await repo.create(makeInput({ title: 'Low', priority: 'low' }));
    await repo.create(makeInput({ title: 'High', priority: 'high' }));
    await repo.create(makeInput({ title: 'Medium', priority: 'medium' }));

    const sorted = await repo.getAll('priority');
    expect(sorted.map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
  });
});

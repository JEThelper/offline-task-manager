// This file simulates a remote REST API for development and testing.
// No real network calls are made — all responses are faked locally.

import type { Task } from '../domain/task';

const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 900;
const FAILURE_RATE = 0.1;

function simulateNetwork(): Promise<void> {
  return new Promise((resolve, reject) => {
    const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Simulated network error'));
      } else {
        resolve();
      }
    }, delay);
  });
}

export async function createTaskRemote(task: Task): Promise<Task> {
  await simulateNetwork();
  return { ...task };
}

export async function updateTaskRemote(task: Task): Promise<Task> {
  await simulateNetwork();
  return { ...task };
}

export async function deleteTaskRemote(id: string): Promise<void> {
  await simulateNetwork();
}

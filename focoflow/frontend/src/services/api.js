const BASE_URL = 'http://localhost:3001/api';

// ─── Tarefas ────────────────────────────────────────────────────────────────
export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`).then(r => r.json());

export const createTask = (data) =>
  fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' }).then(r => r.json());

// ─── Subtarefas ─────────────────────────────────────────────────────────────
export const addSubtask = (taskId, data) =>
  fetch(`${BASE_URL}/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const toggleSubtask = (subtaskId) =>
  fetch(`${BASE_URL}/tasks/subtasks/${subtaskId}/toggle`, {
    method: 'PATCH',
  }).then(r => r.json());

export const deleteSubtask = (subtaskId) =>
  fetch(`${BASE_URL}/tasks/subtasks/${subtaskId}`, { method: 'DELETE' }).then(r => r.json());

export const saveAISubtasks = (taskId, subtasks) =>
  fetch(`${BASE_URL}/tasks/${taskId}/subtasks/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtasks }),
  }).then(r => r.json());

// ─── IA ─────────────────────────────────────────────────────────────────────
export const decomposeTask = (taskTitle, taskDescription = '') =>
  fetch(`${BASE_URL}/ai/decompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskTitle, taskDescription }),
  }).then(r => r.json());
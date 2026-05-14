const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─── GET: Buscar todas as tarefas com subtarefas ───────────────────────────
router.get('/', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();

    // Para cada tarefa, busca suas subtarefas
    const tasksWithSubtasks = tasks.map(task => {
      const subtasks = db.prepare(
        'SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_index'
      ).all(task.id);

      // Calcula progresso (% de subtarefas concluídas)
      const completed = subtasks.filter(s => s.completed === 1).length;
      const progress = subtasks.length > 0
        ? Math.round((completed / subtasks.length) * 100)
        : 0;

      return { ...task, subtasks, progress };
    });

    res.json(tasksWithSubtasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST: Criar nova tarefa ────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { title, description, priority, deadline } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, priority, deadline)
      VALUES (?, ?, ?, ?)
    `).run(title, description || '', priority || 'media', deadline || null);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...newTask, subtasks: [], progress: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE: Deletar tarefa ─────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST: Adicionar subtarefa manualmente ──────────────────────────────────
router.post('/:id/subtasks', (req, res) => {
  const { title, estimated_minutes } = req.body;
  const taskId = req.params.id;

  if (!title) {
    return res.status(400).json({ error: 'Título da subtarefa é obrigatório' });
  }

  try {
    // Pega o maior order_index atual
    const lastOrder = db.prepare(
      'SELECT MAX(order_index) as maxOrder FROM subtasks WHERE task_id = ?'
    ).get(taskId);

    const newOrder = (lastOrder.maxOrder ?? -1) + 1;

    const result = db.prepare(`
      INSERT INTO subtasks (task_id, title, estimated_minutes, order_index)
      VALUES (?, ?, ?, ?)
    `).run(taskId, title, estimated_minutes || 25, newOrder);

    const newSubtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newSubtask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH: Marcar subtarefa como concluída/pendente ───────────────────────
router.patch('/subtasks/:subtaskId/toggle', (req, res) => {
  try {
    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtarefa não encontrada' });

    const newStatus = subtask.completed === 0 ? 1 : 0;
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(newStatus, req.params.subtaskId);

    res.json({ ...subtask, completed: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE: Deletar subtarefa ──────────────────────────────────────────────
router.delete('/subtasks/:subtaskId', (req, res) => {
  try {
    db.prepare('DELETE FROM subtasks WHERE id = ?').run(req.params.subtaskId);
    res.json({ message: 'Subtarefa deletada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST: Salvar subtarefas geradas pela IA ────────────────────────────────
router.post('/:id/subtasks/bulk', (req, res) => {
  const { subtasks } = req.body; // Array de { title, estimated_minutes }
  const taskId = req.params.id;

  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return res.status(400).json({ error: 'Lista de subtarefas inválida' });
  }

  try {
    // Remove subtarefas antigas e insere as novas da IA
    db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(taskId);

    const insertSubtask = db.prepare(`
      INSERT INTO subtasks (task_id, title, estimated_minutes, order_index)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      items.forEach((item, index) => {
        insertSubtask.run(taskId, item.title, item.estimated_minutes || 25, index);
      });
    });

    insertMany(subtasks);

    const saved = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_index').all(taskId);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
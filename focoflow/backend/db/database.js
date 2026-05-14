const Database = require('better-sqlite3');
const db = new Database('./focoflow.db');

// Criação das tabelas ao iniciar
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'media',       -- alta | media | baixa
    deadline TEXT,                        -- ISO 8601 date string
    status TEXT DEFAULT 'pendente',       -- pendente | em_progresso | concluida
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 25, -- baseado em Pomodoro
    completed INTEGER DEFAULT 0,          -- 0 = false, 1 = true
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

module.exports = db;
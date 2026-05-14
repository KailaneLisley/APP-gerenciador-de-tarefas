import React, { useState } from 'react';
import { toggleSubtask, deleteSubtask, addSubtask } from '../services/api';

/**
 * Lista de subtarefas com ações: concluir, deletar, adicionar nova.
 */
const SubtaskList = ({ taskId, subtasks, onUpdate }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [adding, setAdding] = useState(false);

  // Marca/desmarca subtarefa como concluída
  const handleToggle = async (subtaskId) => {
    await toggleSubtask(subtaskId);
    onUpdate(); // Atualiza o estado pai
  };

  // Deleta subtarefa
  const handleDelete = async (subtaskId) => {
    await deleteSubtask(subtaskId);
    onUpdate();
  };

  // Adiciona nova subtarefa manualmente
  const handleAdd = async () => {
    if (!newSubtaskTitle.trim()) return;
    await addSubtask(taskId, { title: newSubtaskTitle.trim() });
    setNewSubtaskTitle('');
    setAdding(false);
    onUpdate();
  };

  return (
    <div className="subtask-list">
      <h4 style={{ margin: '12px 0 8px', fontSize: '0.85rem', color: '#495057' }}>
        Subtarefas ({subtasks.filter(s => s.completed).length}/{subtasks.length})
      </h4>

      {/* Lista de subtarefas */}
      {subtasks.length === 0 && (
        <p style={{ color: '#adb5bd', fontSize: '0.8rem' }}>
          Nenhuma subtarefa ainda. Use a IA ou adicione manualmente.
        </p>
      )}

      {subtasks.map(subtask => (
        <div
          key={subtask.id}
          className="subtask-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0',
            borderBottom: '1px solid #f1f3f5',
          }}
        >
          {/* Checkbox de conclusão */}
          <input
            type="checkbox"
            checked={subtask.completed === 1}
            onChange={() => handleToggle(subtask.id)}
            style={{ cursor: 'pointer', accentColor: '#4dabf7' }}
          />

          {/* Título da subtarefa */}
          <span
            style={{
              flex: 1,
              fontSize: '0.85rem',
              textDecoration: subtask.completed ? 'line-through' : 'none',
              color: subtask.completed ? '#adb5bd' : '#212529',
            }}
          >
            {subtask.title}
          </span>

          {/* Tempo estimado */}
          <span style={{ fontSize: '0.75rem', color: '#868e96' }}>
            ⏱ {subtask.estimated_minutes}min
          </span>

          {/* Botão de deletar */}
          <button
            onClick={() => handleDelete(subtask.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ff6b6b',
              fontSize: '0.8rem',
              padding: '2px 6px',
            }}
            title="Remover subtarefa"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Área de adicionar nova subtarefa */}
      {adding ? (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={e => setNewSubtaskTitle(e.target.value)}
            placeholder="Nome da subtarefa..."
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            style={{
              flex: 1,
              padding: '5px 8px',
              border: '1px solid #dee2e6',
              borderRadius: 6,
              fontSize: '0.85rem',
            }}
          />
          <button onClick={handleAdd} style={{ padding: '5px 10px', borderRadius: 6, background: '#4dabf7', color: '#fff', border: 'none', cursor: 'pointer' }}>
            ✓
          </button>
          <button onClick={() => setAdding(false)} style={{ padding: '5px 10px', borderRadius: 6, background: '#dee2e6', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            marginTop: 8,
            background: 'none',
            border: '1px dashed #dee2e6',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#868e96',
            cursor: 'pointer',
            fontSize: '0.8rem',
            width: '100%',
          }}
        >
          + Adicionar subtarefa
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
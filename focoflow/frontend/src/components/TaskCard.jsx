import React, { useState } from 'react';
import ProgressChart from './ProgressChart';
import SubtaskList from './SubtaskList';
import DeadlineAlert from './DeadlineAlert';
import { decomposeTask, saveAISubtasks, deleteTask } from '../services/api';

// Cores dos cards por prioridade (baseado na Matriz Eisenhower do FocoFlow)
const PRIORITY_COLORS = {
  alta:  { border: '#ff4444', bg: '#fff5f5', label: '🔴 Alta'   },
  media: { border: '#ffcc00', bg: '#fffbe6', label: '🟡 Média'  },
  baixa: { border: '#4dabf7', bg: '#f0f9ff', label: '🔵 Baixa'  },
};

const TaskCard = ({ task, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.media;

  // Chama a IA para decompor a tarefa
  const handleDecompose = async () => {
    setLoadingAI(true);
    try {
      const result = await decomposeTask(task.title, task.description);
      setAiSuggestions(result.subtasks); // Exibe sugestões antes de salvar
    } catch (err) {
      alert('Erro ao conectar com a IA. Tente novamente.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Salva sugestões da IA no banco
  const handleAcceptAI = async () => {
    await saveAISubtasks(task.id, aiSuggestions);
    setAiSuggestions(null);
    onUpdate(); // Atualiza o dashboard
  };

  // Descarta sugestões da IA
  const handleRejectAI = () => setAiSuggestions(null);

  // Deleta a tarefa inteira
  const handleDeleteTask = async () => {
    if (window.confirm(`Deletar "${task.title}"?`)) {
      await deleteTask(task.id);
      onUpdate();
    }
  };

  return (
    <div
      className="task-card"
      style={{
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.bg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* ─── Cabeçalho do Card ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Gráfico de progresso em arco */}
        <ProgressChart progress={task.progress} size={80} />

        {/* Informações da tarefa */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#212529' }}>{task.title}</h3>
            <button
              onClick={handleDeleteTask}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: '1rem' }}
              title="Deletar tarefa"
            >
              🗑
            </button>
          </div>

          {task.description && (
            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#868e96' }}>
              {task.description}
            </p>
          )}

          {/* Badges de prioridade e prazo */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{colors.label}</span>
            <DeadlineAlert deadline={task.deadline} />
          </div>
        </div>
      </div>

      {/* ─── Botão de expandir ─────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          marginTop: 12,
          background: 'none',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '5px 0',
          cursor: 'pointer',
          color: '#495057',
          fontSize: '0.82rem',
        }}
      >
        {expanded ? '▲ Recolher' : '▼ Ver subtarefas e IA'}
      </button>

      {/* ─── Área expandida ────────────────────────────────────────────── */}
      {expanded && (
        <div style={{ marginTop: 12 }}>

          {/* Sugestões da IA (antes de salvar) */}
          {aiSuggestions && (
            <div style={{
              background: '#e7f5ff',
              border: '1px solid #74c0fc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1971c2', fontSize: '0.85rem' }}>
                🤖 Sugestão da IA — Aceitar ou descartar?
              </p>
              {aiSuggestions.map((s, i) => (
                <div key={i} style={{ fontSize: '0.83rem', padding: '3px 0', color: '#343a40' }}>
                  {i + 1}. {s.title} <span style={{ color: '#868e96' }}>({s.estimated_minutes}min)</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={handleAcceptAI}
                  style={{ flex: 1, padding: '6px', background: '#4dabf7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  ✅ Aceitar
                </button>
                <button
                  onClick={handleRejectAI}
                  style={{ flex: 1, padding: '6px', background: '#dee2e6', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  ✕ Descartar
                </button>
              </div>
            </div>
          )}

          {/* Botão de chamar a IA */}
          {!aiSuggestions && (
            <button
              onClick={handleDecompose}
              disabled={loadingAI}
              style={{
                width: '100%',
                padding: '8px',
                background: loadingAI ? '#dee2e6' : '#7950f2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: loadingAI ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginBottom: 10,
              }}
            >
              {loadingAI ? '⏳ Analisando com IA...' : '🤖 Decompor com IA'}
            </button>
          )}

          {/* Lista de subtarefas */}
          <SubtaskList
            taskId={task.id}
            subtasks={task.subtasks}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCard;
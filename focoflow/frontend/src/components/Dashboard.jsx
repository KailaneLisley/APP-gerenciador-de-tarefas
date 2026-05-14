import React, { useState, useEffect, useCallback } from 'react';
import TaskCard from './TaskCard';
import { getTasks, createTask } from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'media',
    deadline: '',
  });

  // Busca tarefas do backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Cria nova tarefa
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    await createTask(form);
    setForm({ title: '', description: '', priority: 'media', deadline: '' });
    setShowForm(false);
    fetchTasks();
  };

  // Métricas do dashboard
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.progress === 100).length;
  const avgProgress = totalTasks > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
    : 0;
  const expiredTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px', fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', color: '#212529', margin: 0 }}>
          🎯 FocoFlow
        </h1>
        <p style={{ color: '#868e96', margin: '4px 0 0', fontSize: '0.9rem' }}>
          Seu assistente de foco para TDAH
        </p>
      </div>

      {/* ─── Cards de métricas ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Tarefas', value: totalTasks, icon: '📋', color: '#4dabf7' },
          { label: 'Concluídas', value: completedTasks, icon: '✅', color: '#40c057' },
          { label: 'Progresso', value: `${avgProgress}%`, icon: '📊', color: '#7950f2' },
          { label: 'Expiradas', value: expiredTasks, icon: '🔴', color: '#ff4444' },
        ].map((metric, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: `1px solid ${metric.color}33`,
              borderRadius: 10,
              padding: '12px 8px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '1.3rem' }}>{metric.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: metric.color }}>{metric.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#868e96' }}>{metric.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Botão de nova tarefa ────────────────────────────────────────── */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: '100%',
          padding: '12px',
          background: '#7950f2',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1rem',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(121, 80, 242, 0.35)',
        }}
      >
        {showForm ? '✕ Cancelar' : '+ Nova Tarefa'}
      </button>

      {/* ─── Formulário de nova tarefa ───────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleCreateTask}
          style={{
            background: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', color: '#212529' }}>📝 Nova Tarefa</h3>

          <input
            type="text"
            placeholder="O que precisa ser feito? (ex: Fazer trabalho de faculdade)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            style={inputStyle}
          />

          <textarea
            placeholder="Descrição adicional (opcional)..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={inputStyle}
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🔵 Baixa</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prazo</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              marginTop: 8,
              background: '#40c057',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            ✅ Criar Tarefa
          </button>
        </form>
      )}

      {/* ─── Lista de TaskCards ──────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#868e96' }}>
          ⏳ Carregando tarefas...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>
          <p style={{ fontSize: '2rem' }}>🎯</p>
          <p>Nenhuma tarefa ainda. Crie sua primeira!</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
        ))
      )}
    </div>
  );
};

// Estilos reutilizáveis
const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #dee2e6',
  borderRadius: 8,
  fontSize: '0.9rem',
  marginBottom: 10,
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#495057',
  marginBottom: 4,
};

export default Dashboard;
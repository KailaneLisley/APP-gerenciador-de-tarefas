import React from 'react';

/**
 * Componente de alerta visual de prazo.
 * Retorna badge colorido com status do prazo.
 */
const DeadlineAlert = ({ deadline }) => {
  if (!deadline) return null;

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Define status e estilo conforme proximidade do prazo
  let status, label, style;

  if (diffMs < 0) {
    // Prazo expirado
    status = 'expired';
    label = '🔴 Prazo expirado';
    style = { backgroundColor: '#ff4444', color: '#fff' };
  } else if (diffHours <= 2) {
    // Menos de 2 horas
    status = 'critical';
    label = `🚨 Vence em ${Math.round(diffHours * 60)} min`;
    style = { backgroundColor: '#ff6600', color: '#fff' };
  } else if (diffDays <= 1) {
    // Menos de 1 dia
    status = 'urgent';
    label = `⚠️ Vence em ${Math.round(diffHours)}h`;
    style = { backgroundColor: '#ffcc00', color: '#333' };
  } else if (diffDays <= 7) {
    // Menos de 1 semana
    status = 'soon';
    label = `📅 Vence em ${Math.ceil(diffDays)} dias`;
    style = { backgroundColor: '#4dabf7', color: '#fff' };
  } else {
    // No prazo
    status = 'ok';
    label = `✅ Prazo: ${due.toLocaleDateString('pt-BR')}`;
    style = { backgroundColor: '#40c057', color: '#fff' };
  }

  return (
    <span
      className={`deadline-badge deadline-${status}`}
      style={{
        ...style,
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
};

export default DeadlineAlert;
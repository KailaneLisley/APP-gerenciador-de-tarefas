import React from 'react';

/**
 * Gráfico de arco (semi-círculo) mostrando progresso da tarefa.
 * Usa SVG puro, sem dependências externas.
 */
const ProgressChart = ({ progress = 0, size = 80 }) => {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // semi-círculo
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Cor muda conforme progresso
  const color =
    progress === 100 ? '#40c057' :  // Verde - concluído
    progress >= 60   ? '#4dabf7' :  // Azul - bom progresso
    progress >= 30   ? '#ffcc00' :  // Amarelo - início
                       '#adb5bd';   // Cinza - não iniciado

  return (
    <div style={{ textAlign: 'center', width: size }}>
      <svg
        width={size}
        height={size / 2 + 10}
        viewBox={`0 0 ${size} ${size / 2 + 10}`}
      >
        {/* Trilha de fundo (cinza) */}
        <path
          d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke="#e9ecef"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Arco de progresso colorido */}
        <path
          d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
        {/* Texto central com porcentagem */}
        <text
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={color}
        >
          {progress}%
        </text>
      </svg>
    </div>
  );
};

export default ProgressChart;
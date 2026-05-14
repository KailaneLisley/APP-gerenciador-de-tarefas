const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Inicializa o cliente OpenAI com sua chave de API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── POST: Recebe tarefa e retorna subtarefas sugeridas ─────────────────────
router.post('/decompose', async (req, res) => {
  const { taskTitle, taskDescription } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ error: 'Título da tarefa é obrigatório' });
  }

  try {
    const prompt = `
Você é um assistente especializado em ajudar pessoas com TDAH a organizarem suas tarefas.

Sua função: Decompor a tarefa abaixo em 3 a 5 subtarefas claras, específicas e pequenas.

Regras IMPORTANTES:
- Cada subtarefa deve ser realizável em 20 a 30 minutos (técnica Pomodoro)
- Use linguagem simples e direta (evite termos vagos)
- As subtarefas devem estar em ordem lógica de execução
- Retorne APENAS um JSON válido, sem texto adicional

Formato de saída:
{
  "subtasks": [
    { "title": "nome da subtarefa", "estimated_minutes": 25 },
    { "title": "nome da subtarefa", "estimated_minutes": 20 }
  ]
}

Tarefa: "${taskTitle}"
${taskDescription ? `Descrição adicional: "${taskDescription}"` : ''}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais barato e rápido para este caso
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const rawContent = completion.choices[0].message.content.trim();

    // Parse do JSON retornado pela IA
    const parsed = JSON.parse(rawContent);

    if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
      throw new Error('Formato de resposta da IA inválido');
    }

    res.json(parsed);
  } catch (err) {
    console.error('Erro na IA:', err.message);

    // Fallback: subtarefas genéricas se a IA falhar
    res.json({
      subtasks: [
        { title: `Planejar: ${taskTitle}`, estimated_minutes: 20 },
        { title: `Executar parte principal: ${taskTitle}`, estimated_minutes: 25 },
        { title: `Revisar e finalizar: ${taskTitle}`, estimated_minutes: 20 },
      ],
      fallback: true, // Indica que veio do fallback
    });
  }
});

module.exports = router;
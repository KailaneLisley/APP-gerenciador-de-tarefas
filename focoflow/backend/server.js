const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  console.log(`✅ FocoFlow Backend rodando na porta ${PORT}`);
});
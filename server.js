const express = require('express');
const cors = require('cors'); // <--- NOVO
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // <--- NOVO: Isso libera a entrada de dados de qualquer site (como o SIGAA)

app.get('/', (req, res) => res.send('Servidor Online'));

app.post('/receber-nome', (req, res) => {
    const { nome } = req.body;
    
    if (nome) {
        console.log(`[SIGAA] Aluno identificado: ${nome}`); // Vai aparecer no seu terminal
        return res.json({ status: 'recebido' });
    }
    res.status(400).json({ status: 'erro' });
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
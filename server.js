require('dotenv').config(); // Carrega .env

const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(express.json());
app.use(cors());

// --- CONEXÃO COM POSTGRES ---
const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: { rejectUnauthorized: false }
});

// Conecta ao banco ao iniciar
client.connect()
    .then(() => console.log("🔥 Conectado ao PostgreSQL!"))
    .catch(err => console.error("❌ Erro ao conectar no banco:", err));


// Rota 1: Página inicial simples
app.get('/', (req, res) => {
    res.send('Servidor do Gatinho está ON! 🐱');
});


// Rota 2: Recebe nome e salva no banco
app.post('/receber-nome', async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: 'Nome não enviado' });
    }

    try {
        const query = `
            INSERT INTO tabela_logs (nome, data_registro)
            VALUES ($1, NOW())
            RETURNING *;
        `;

        await client.query(query, [nome]);

        console.log(`🐱 [NOVO ALUNO] ${nome}`);

        return res.json({ status: 'Sucesso', mensagem: 'Nome salvo no banco!' });

    } catch (err) {
        console.error("❌ Erro ao salvar:", err);
        return res.status(500).json({ erro: 'Erro ao salvar no banco' });
    }
});


// Rota 3: Página secreta que lista nomes do banco
app.get('/clicounolink', async (req, res) => {
    try {
        const busca = await client.query(`
            SELECT nome, data_registro 
            FROM tabela_logs
            ORDER BY id DESC;
        `);

        const lista = busca.rows;

        const itensDaLista = lista.map(item => `
            <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                <span style="color: #666; font-size: 0.8em;">
                    ${new Date(item.data_registro).toLocaleString('pt-BR')}
                </span><br>
                <strong>${item.nome}</strong>
            </li>
        `).join('');

        const htmlPagina = `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lista de Capturados</title>
                <style>
                    body { font-family: sans-serif; background-color: #f4f4f9; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    h1 { color: #333; text-align: center; }
                    ul { list-style: none; padding: 0; }
                    .contador { text-align: center; color: #888; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🐱 Nomes Recebidos</h1>
                    <div class="contador">Total capturado: ${lista.length}</div>
                    <ul>
                        ${lista.length > 0 ? itensDaLista : '<p style="text-align:center">Nenhum nome recebido ainda...</p>'}
                    </ul>
                </div>
                <script>
                    setTimeout(() => window.location.reload(), 5000);
                </script>
            </body>
            </html>
        `;

        res.send(htmlPagina);

    } catch (err) {
        console.error("❌ Erro ao buscar no banco:", err);
        res.status(500).send("Erro ao carregar lista");
    }
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Página secreta: http://localhost:${PORT}/clicounolink`);
});

const express = require('express');
const cors = require('cors');
const app = express();

// Define a porta (nuvem ou local)
const PORT = process.env.PORT || 3000;

// Configurações
app.use(express.json());
app.use(cors()); // Permite receber dados do script do SIGAA

// --- MEMÓRIA TEMPORÁRIA ---
// Aqui vamos guardar os nomes.
// OBS: Se você reiniciar o servidor, essa lista zera!
const listaDeNomes = [];

// Rota 1: Página inicial simples
app.get('/', (req, res) => {
    res.send('Servidor do Gatinho está ON! 🐱');
});

// Rota 2: Receber o nome (Vem do script do navegador)
app.post('/receber-nome', (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: 'Sem nome' });
    }

    // Pega a hora atual
    const hora = new Date().toLocaleString('pt-BR');

    // Salva na nossa lista
    listaDeNomes.unshift({ nome, hora }); // 'unshift' coloca no topo da lista

    console.log(`[NOVO ALUNO] ${nome} às ${hora}`);
    
    return res.json({ status: 'Sucesso', mensagem: 'Nome guardado!' });
});

// Rota 3: A página secreta que lista os nomes
// Acesse em: http://localhost:3000/clicounolink
app.get('/clicounolink', (req, res) => {
    
    // Cria o HTML da lista dinamicamente
    const itensDaLista = listaDeNomes.map(item => `
        <li style="padding: 10px; border-bottom: 1px solid #ddd;">
            <span style="color: #666; font-size: 0.8em;">${item.hora}</span><br>
            <strong>${item.nome}</strong>
        </li>
    `).join('');

    // HTML completo da página
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
                <div class="contador">Total capturado: ${listaDeNomes.length}</div>
                <ul>
                    ${listaDeNomes.length > 0 ? itensDaLista : '<p style="text-align:center">Nenhum nome recebido ainda...</p>'}
                </ul>
            </div>
            <script>
                setTimeout(() => window.location.reload(), 5000);
            </script>
        </body>
        </html>
    `;

    res.send(htmlPagina);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando!`);
    console.log(`Para ver os nomes, acesse: http://localhost:${PORT}/clicounolink`);
});

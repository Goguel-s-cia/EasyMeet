const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Permite que o Node entenda requisições com JSON
app.use(express.json());

// Diz para o Express servir os arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para os arquivos de "banco de dados"
const gruposPath = path.join(__dirname, 'data', 'grupos.json');
const eventosPath = path.join(__dirname, 'data', 'eventos.json');

// Rotas da API

// Get: Busca os grupos e os eventos para montar o Kanban
app.get('/api/board', (req, res) => {
    try {
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        const eventos = JSON.parse(fs.readFileSync(eventosPath, 'utf8'));
        
        // Retorna os dois juntos para facilitar o trabalho do Frontend
        res.json({ grupos, eventos });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao ler os arquivos do banco de dados.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
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

// Post:Criar novo grupo
app.post('/api/grupos', (req, res) => {
    try {
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        
        // Monta o objeto do novo grupo
        const novoGrupo = {
            // Gera um ID simples baseado no nome (ex: "Mobile Dev" -> "mobile-dev")
            id: req.body.grupoNome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'), 
            titulo: req.body.grupoNome,
            descricao: req.body.grupoDescricao
        };

        grupos.push(novoGrupo);
        // Salva o array atualizado de volta no arquivo grupos.json
        fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
        
        res.status(201).json({ mensagem: 'Grupo criado com sucesso!', grupo: novoGrupo });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao salvar o grupo no servidor.' });
    }
});

// Post: Criar novo evento
app.post('/api/eventos', (req, res) => {
    try {
        const eventos = JSON.parse(fs.readFileSync(eventosPath, 'utf8'));
        
        // Monta o objeto do novo evento
        const novoEvento = {
            id: Date.now(), // Gera um ID único baseado na data e hora atual
            grupoId: req.body.eventoGrupo,
            titulo: req.body.eventoNome,
            descricao: req.body.eventoDescricao,
            data: req.body.eventoData,
            participantes: parseInt(req.body.eventoParticipantes) || 0, // Garante que seja um número
            confirmado: false
        };

        eventos.push(novoEvento);
        // Salva o array atualizado de volta no arquivo eventos.json
        fs.writeFileSync(eventosPath, JSON.stringify(eventos, null, 2));

        res.status(201).json({ mensagem: 'Evento criado com sucesso!', evento: novoEvento });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao salvar o evento no servidor.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
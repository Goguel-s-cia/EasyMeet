document.addEventListener('DOMContentLoaded', () => {
    const eventInfos = document.querySelectorAll('.event-info');
    const openGrupo = document.getElementById('btn-open-grupo');
    const openEvento = document.getElementById('btn-open-evento');
    const formsPanel = document.getElementById('forms-panel');
    const cardGrupo = document.getElementById('card-criar-grupo');
    const cardEvento = document.getElementById('card-criar-evento');
    const closeButtons = document.querySelectorAll('.close-panel');
    const kanbanBoard = document.getElementById('kanban-board');

    // Função para buscar os dados do Backend e renderizar a tela
    async function carregarQuadro() {
        try {
            // Faz a requisição para a rota no server.js
            const resposta = await fetch('/api/board');
            const dados = await resposta.json();
            
            kanbanBoard.innerHTML = ''; // Limpando a tela

            // Para cada grupo, cria uma coluna
            dados.grupos.forEach(grupo => {
                const coluna = document.createElement('div');
                coluna.className = 'kanban-column';
                coluna.dataset.grupoId = grupo.id; 

                let htmlEventos = '';
                // Filtra os eventos que pertencem a este grupo específico
                const eventosDoGrupo = dados.eventos.filter(e => e.grupoId === grupo.id);

                if (eventosDoGrupo.length === 0) {
                    htmlEventos = `
                        <div class="empty-state">
                            <p>Nenhum evento programado.</p>
                        </div>`;
                } else {
                    eventosDoGrupo.forEach(evento => {
                        htmlEventos += `
                            <div class="event-card" data-evento-id="${evento.id}">
                                <h4>${evento.titulo}</h4>
                                <p>${evento.descricao}</p>
                                <div class="event-details">
                                    <small><strong>Data:</strong> ${new Date(evento.data).toLocaleString('pt-BR')}</small>
                                    <small><strong>Participantes:</strong> ${evento.participantes}</small>
                                </div>
                                <div class="event-info">
                                    <button class="btn ${evento.confirmado ? 'btn-danger' : 'btn-success'}">
                                        ${evento.confirmado ? 'Cancelar presença' : 'Confirmar presença'}
                                    </button>
                                    <span class="badge ${evento.confirmado ? 'badge-success' : 'badge-warning'}">
                                        ${evento.confirmado ? 'Confirmado' : 'Não confirmado'}
                                    </span>
                                </div>
                            </div>
                        `;
                    });
                }

                coluna.innerHTML = `
                    <div class="column-header">
                        <h3>${grupo.titulo}</h3>
                        <p>${grupo.descricao}</p>
                    </div>
                    <div class="column-content">
                        ${htmlEventos}
                    </div>
                `;

                kanbanBoard.appendChild(coluna);
            });

            configurarBotoesPresenca();

        } catch (erro) {
            console.error('Erro ao carregar o quadro:', erro);
            kanbanBoard.innerHTML = '<p style="padding: 20px;">Erro ao carregar os dados do servidor.</p>';
        }
    }

    function configurarBotoesPresenca() {
        const eventInfos = document.querySelectorAll('.event-info');
        eventInfos.forEach(info => {
        const btn = info.querySelector('.btn');
        const badge = info.querySelector('.badge');

        if (btn && badge) {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('btn-success')) {
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-danger');
                    btn.textContent = 'Cancelar presença';

                    badge.classList.remove('badge-warning');
                    badge.classList.add('badge-success');
                    badge.textContent = 'Confirmado';
                } else {
                    btn.classList.remove('btn-danger');
                    btn.classList.add('btn-success');
                    btn.textContent = 'Confirmar presença';

                    badge.classList.remove('badge-success');
                    badge.classList.add('badge-warning');
                    badge.textContent = 'Não confirmado';
                }
            });
        }
    });
    }

    // Inicia o carregamento assim que a página abre
    carregarQuadro();

    function openFormCard(targetCard) {
        formsPanel.classList.remove('hidden');
        cardGrupo.classList.add('hidden');
        cardEvento.classList.add('hidden');
        targetCard.classList.remove('hidden');
    }

    function closeForms() {
        formsPanel.classList.add('hidden');
        cardGrupo.classList.add('hidden');
        cardEvento.classList.add('hidden');
    }

    openGrupo?.addEventListener('click', (event) => {
        event.preventDefault();
        openFormCard(cardGrupo);
    });

    openEvento?.addEventListener('click', (event) => {
        event.preventDefault();
        openFormCard(cardEvento);
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeForms);
    });

    
});

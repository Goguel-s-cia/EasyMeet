document.addEventListener('DOMContentLoaded', () => {
    const eventInfos = document.querySelectorAll('.event-info');
    const openGrupo = document.getElementById('btn-open-grupo');
    const openEvento = document.getElementById('btn-open-evento');
    const formsPanel = document.getElementById('forms-panel');
    const cardGrupo = document.getElementById('card-criar-grupo');
    const cardEvento = document.getElementById('card-criar-evento');
    const closeButtons = document.querySelectorAll('.close-panel');
    const kanbanBoard = document.getElementById('kanban-board');
    const formCriarGrupo = document.getElementById('form-criar-grupo');
    const formCriarEvento = document.getElementById('form-criar-evento');

    // Função para buscar os dados do Backend e renderizar a tela
    async function carregarQuadro() {
        const kanbanBoard = document.getElementById('kanban-board');
        const selectGrupo = document.getElementById('evento-grupo');

        try {
            // Busca os dados do Backend
            const resposta = await fetch('/api/board');
            const dados = await resposta.json();
            
            // Limpa o quadro e o select para evitar duplicações
            kanbanBoard.innerHTML = ''; 
            if (selectGrupo) selectGrupo.innerHTML = ''; 

            // Tratamento: Se o banco de dados estiver sem nenhum grupo
            if (!dados.grupos || dados.grupos.length === 0) {
                kanbanBoard.innerHTML = `
                    <div class="empty-state" style="width: 100%; margin-top: 50px;">
                        <p>Nenhum grupo cadastrado. Crie o seu primeiro grupo no menu lateral!</p>
                    </div>`;
                if (selectGrupo) {
                    selectGrupo.innerHTML = '<option value="" disabled selected>Crie um grupo primeiro</option>';
                }
                return;
            }

            // Percorre os grupos vindos do servidor
            dados.grupos.forEach(grupo => {
                
                // 1. Adiciona o grupo como opção no formulário de criar evento
                if (selectGrupo) {
                    const option = document.createElement('option');
                    option.value = grupo.id;
                    option.textContent = grupo.titulo;
                    selectGrupo.appendChild(option);
                }

                // 2. Cria a coluna do Kanban visualmente
                const coluna = document.createElement('div');
                coluna.className = 'kanban-column';
                coluna.dataset.grupoId = grupo.id; 

                // 3. Separa apenas os eventos pertencentes a este grupo
                const eventosDoGrupo = dados.eventos ? dados.eventos.filter(e => e.grupoId === grupo.id) : [];
                let htmlEventos = '';

                // 4. Monta os cartões de eventos
                if (eventosDoGrupo.length === 0) {
                    htmlEventos = `
                        <div class="empty-state">
                            <p>Nenhum evento programado.</p>
                        </div>`;
                } else {
                    eventosDoGrupo.forEach(evento => {
                        // Formata a data para ficar amigável (DD/MM/AAAA às HH:MM)
                        const dataObj = new Date(evento.data);
                        const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' às ' + dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

                        htmlEventos += `
                            <div class="event-card" data-evento-id="${evento.id}" draggable="true">
                                <h4>${evento.titulo}</h4>
                                <p>${evento.descricao}</p>
                                <div class="event-details">
                                    <small><strong>Data:</strong> ${dataFormatada}</small>
                                    <small><strong>Participantes:</strong> <span class="qtd-participantes">${evento.participantes}</span></small>
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

                // 5. Injeta o HTML montado na coluna
                coluna.innerHTML = `
                    <div class="column-header">
                        <h3>${grupo.titulo}</h3>
                        <p>${grupo.descricao}</p>
                    </div>
                    <div class="column-content" id="content-${grupo.id}">
                        ${htmlEventos}
                    </div>
                `;

                kanbanBoard.appendChild(coluna);
            });

            configurarBotoesPresenca();
            configurarDragAndDrop();

        } catch (erro) {
            console.error('Erro ao carregar o quadro:', erro);
            kanbanBoard.innerHTML = '<p style="padding: 20px; color: var(--danger-color);">Erro de comunicação com o servidor Node.js.</p>';
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

    // Salvar Novo Grupo
    formCriarGrupo?.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede a página de recarregar
        
        const dados = {
            grupoNome: document.getElementById('grupo-nome').value,
            grupoDescricao: document.getElementById('grupo-descricao').value
        };

        try {
            await fetch('/api/grupos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            formCriarGrupo.reset(); // Limpa os campos digitados
            closeForms(); // Fecha o painel lateral
            carregarQuadro(); // Puxa os dados novos e redesenha a tela automaticamente
        } catch (erro) {
            console.error('Erro ao criar grupo:', erro);
            alert('Falha ao comunicar com o servidor.');
        }
    });

    // Salvar Novo Evento
    formCriarEvento?.addEventListener('submit', async (evento) => {
        evento.preventDefault(); 
        
        const dados = {
            eventoNome: document.getElementById('evento-nome').value,
            eventoDescricao: document.getElementById('evento-descricao').value,
            eventoData: document.getElementById('evento-data').value,
            eventoGrupo: document.getElementById('evento-grupo').value,
            eventoParticipantes: document.getElementById('evento-participantes').value
        };

        try {
            await fetch('/api/eventos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            formCriarEvento.reset(); 
            closeForms(); 
            carregarQuadro(); 
        } catch (erro) {
            console.error('Erro ao criar evento:', erro);
            alert('Falha ao comunicar com o servidor.');
        }
    });

    function configurarDragAndDrop() {
        // Seleciona todos os cartões e as áreas onde eles podem ser soltos (as colunas)
        const cartoes = document.querySelectorAll('.event-card');
        const areasDeSoltura = document.querySelectorAll('.column-content');

        // 1. Lógica para o cartão que está sendo arrastado
        cartoes.forEach(cartao => {
            cartao.addEventListener('dragstart', (e) => {
                // Guarda o ID do evento na memória do navegador enquanto arrasta
                e.dataTransfer.setData('text/plain', cartao.dataset.eventoId);
                cartao.classList.add('dragging'); // Classe CSS para ficar meio transparente
            });

            cartao.addEventListener('dragend', () => {
                cartao.classList.remove('dragging'); // Tira a transparência ao soltar
            });
        });

        // 2. Lógica para a coluna que vai receber o cartão
        areasDeSoltura.forEach(area => {
            // "dragover" acontece o tempo todo enquanto o mouse passa por cima da coluna
            area.addEventListener('dragover', (e) => {
                e.preventDefault(); // Essencial: Por padrão, o HTML não deixa soltar elementos. Isso desativa o bloqueio.
                area.classList.add('drag-over'); // Escurece o fundo pra mostrar que aceita
            });

            // Quando o mouse sai de cima da coluna sem soltar
            area.addEventListener('dragleave', () => {
                area.classList.remove('drag-over');
            });

            // Quando o usuário solta o clique do mouse
            area.addEventListener('drop', async (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');

                // Resgata aquele ID salvo lá no "dragstart"
                const eventoId = e.dataTransfer.getData('text/plain');
                
                // Descobre de qual grupo é essa coluna (subindo até achar a div pai)
                const kanbanColumn = area.closest('.kanban-column');
                const novoGrupoId = kanbanColumn.dataset.grupoId;

                try {
                    // Manda a atualização do evento pro Backend
                    await fetch(`/api/eventos/${eventoId}/mover`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ novoGrupoId: novoGrupoId })
                    });

                    // Em vez de manipular o HTML na mão, recarrega o quadro do banco de dados,
                    // garantindo assim que a tela e o JSON estão iguais.
                    carregarQuadro();
                } catch (erro) {
                    console.error('Erro ao mover evento:', erro);
                }
            });
        });
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

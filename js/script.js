document.addEventListener('DOMContentLoaded', () => {
    const eventInfos = document.querySelectorAll('.event-info');
    const openGrupo = document.getElementById('btn-open-grupo');
    const openEvento = document.getElementById('btn-open-evento');
    const formsPanel = document.getElementById('forms-panel');
    const cardGrupo = document.getElementById('card-criar-grupo');
    const cardEvento = document.getElementById('card-criar-evento');
    const closeButtons = document.querySelectorAll('.close-panel');

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
});

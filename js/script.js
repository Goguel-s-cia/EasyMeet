document.addEventListener('DOMContentLoaded', () => {
    
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
});

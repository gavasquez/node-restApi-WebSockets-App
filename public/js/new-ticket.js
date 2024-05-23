const currentTicketLabel = document.querySelector('#lbl-new-ticket');
const createTicketBtn = document.querySelector('button');


async function getLastTicket() {
    const resp = await fetch('http://localhost:3000/api/ticket/last', { method: 'GET' });
    const data = await resp.json();
    currentTicketLabel.innerHTML = data;
}

async function createTicket() {
    const resp = await fetch('http://localhost:3000/api/ticket', { method: 'POST' });
    const { number } = await resp.json();
    currentTicketLabel.innerHTML = number;
}

createTicketBtn.addEventListener('click', async function () {
    await createTicket();
});

getLastTicket();
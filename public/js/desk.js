// Referencias
const lblPending = document.querySelector('#lbl-pending');
const deskHeader = document.querySelector('h1');
const noMoreAlert = document.querySelector('.alert');
const lblCurrentTicket = document.querySelector('small');
const btnDraw = document.querySelector('#btn-draw');
const btnDone = document.querySelector('#btn-done');

const searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has('escritorio')) {
    window.location = 'index.html';
    throw new Error('Escritorio es requerido');
}

const deskNumber = searchParams.get('escritorio');
let workingTicket = null;
deskHeader.innerText = deskNumber;

function checkTicketCount(currentCount = 0) {
    if (currentCount === 0) {
        noMoreAlert.classList.remove('d-none');
    } else {
        noMoreAlert.classList.add('d-none');
    }
    lblPending.innerHTML = currentCount;
}

async function getTicket() {
    await finishTicket();
    const { status, ticket, message } = await fetch(`/api/ticket/draw/${deskNumber}`)
        .then(resp => resp.json());
    if (status === 'error') {
        lblCurrentTicket.innerText = message;
        return;
    }
    workingTicket = ticket;
    lblCurrentTicket.innerText = ticket.number;
}

async function finishTicket() {
    if (!workingTicket) return;
    const { status, message } = await fetch(`http://localhost:3000/api/ticket/done/${workingTicket.id}`, {
        method: 'PUT'
    })
        .then(resp => resp.json());
    if (status === 'ok') {
        workingTicket = null;
        lblCurrentTicket.innerText = 'Nadie';
    }
}


async function loadInitialCount() {
    const pendingTickets = await fetch('http://localhost:3000/api/ticket/pending')
        .then(resp => resp.json());
    checkTicketCount(pendingTickets.length);
}

function connectToWebSockets() {

    const socket = new WebSocket('ws://localhost:3000/ws');

    socket.onmessage = (event) => {
        const { type, payload } = JSON.parse(event.data);
        if (type !== 'on-ticket-count-change') return;
        checkTicketCount(payload);
    };

    socket.onclose = (event) => {
        console.log('Connection closed');
        setTimeout(() => {
            console.log('retrying to connect');
            connectToWebSockets();
        }, 1500);

    };

    socket.onopen = (event) => {
        console.log('Connected');
    };

}

// Listener
btnDraw.addEventListener('click', getTicket);
btnDone.addEventListener('click', finishTicket);



// init
loadInitialCount();
connectToWebSockets();
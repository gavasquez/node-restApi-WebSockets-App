import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket";
import { WssService } from "./wss.service";


export class TicketService {

    constructor(
        private readonly wssService = WssService.instance,
    ){}

    public tickets: Ticket[] = [
        {
            id: UuidAdapter.v4(),
            number: 1,
            createdAt: new Date(),
            done: false,
        },
        {
            id: UuidAdapter.v4(),
            number: 2,
            createdAt: new Date(),
            done: false,
        },
        {
            id: UuidAdapter.v4(),
            number: 3,
            createdAt: new Date(),
            done: false,
        }
        , {
            id: UuidAdapter.v4(),
            number: 4,
            createdAt: new Date(),
            done: false,
        }
        , {
            id: UuidAdapter.v4(),
            number: 5,
            createdAt: new Date(),
            done: false,
        },
        {
            id: UuidAdapter.v4(),
            number: 6,
            createdAt: new Date(),
            done: false,
        }
    ];

    private readonly workingOnTickets: Ticket[] = [];

    public get pendingTickets(): Ticket[] {
        return this.tickets.filter(ticket => !ticket.handleAtDesk);
    }

    public get lastWorkingOnTickets(): Ticket[] {
        return this.workingOnTickets.slice(0, 4);
    }

    public get lasTicketNumber(): number {
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0;
        //return this.tickets.length > 0 ? this.tickets[this.tickets.length -1].number: 0;
    }

    public createTicket() {
        const newTicket: Ticket = {
            id: UuidAdapter.v4(),
            number: this.lasTicketNumber + 1,
            createdAt: new Date(),
            done: false,
            handleAt: undefined,
            handleAtDesk: undefined,
        }
        this.tickets.push(newTicket);
        // TODO: WS
        this.onTicketNumberChanged();
        return newTicket;
    }

    public drawTicket(desk: string) {
        const ticket = this.tickets.find(t => !t.handleAtDesk);
        if (!ticket) return { status: 'error', message: 'No hay tickets pendientes' };
        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();
        this.workingOnTickets.unshift({...ticket});
        // TODO: WS
        this.onTicketNumberChanged();
        this.onWorkingOnChanged();
        return { stattus: 'ok', ticket };
    }

    public onFinishTicket(id: string) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return { status: 'error', message: 'Ticket no encontrado' };
        this.tickets = this.tickets.map(ticket => {
            if (ticket.id === id) {
                ticket.done = true;
            }
            return ticket;
        });
        return { status: 'ok' };
    }

    private onTicketNumberChanged() {
        this.wssService.sendMessage('on-ticket-count-change', this.pendingTickets.length);
    }

    private onWorkingOnChanged() {
        this.wssService.sendMessage('on-working-changed', this.lastWorkingOnTickets);
    }

}
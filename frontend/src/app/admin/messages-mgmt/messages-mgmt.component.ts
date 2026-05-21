import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ContactMessage } from '../../models/interfaces';

@Component({
  selector: 'app-messages-mgmt',
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h2>Mensajes de Contacto</h2>
      <span class="msg-count">{{ unread() }} sin leer</span>
    </div>

    <div class="messages-list">
      @for (m of messages(); track m.id) {
        <div class="msg-card" [class.unread]="!m.isRead">
          <div class="msg-header">
            <div class="msg-sender">
              <span class="material-icons">{{ m.isRead ? 'mail' : 'mark_email_unread' }}</span>
              <div>
                <strong>{{ m.name }}</strong>
                <span class="msg-email">{{ m.email }}</span>
              </div>
            </div>
            <div class="msg-meta">
              <span class="msg-date">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              <div class="msg-actions">
                @if (!m.isRead) {
                  <button class="icon-btn" (click)="markRead(m.id!)" title="Marcar como leído">
                    <span class="material-icons">done</span>
                  </button>
                }
                <button class="icon-btn danger" (click)="deleteMsg(m.id!)" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>
          @if (m.phone) {
            <div class="msg-phone">
              <span class="material-icons">phone</span> {{ m.phone }}
            </div>
          }
          <p class="msg-body">{{ m.message }}</p>
        </div>
      } @empty {
        <div class="empty-state">
          <span class="material-icons">inbox</span>
          <p>No hay mensajes</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    h2 { font-size: 1.8rem; color: var(--text-light); }
    .msg-count { background: rgba(200,169,126,0.15); color: var(--gold); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; }

    .messages-list { display: flex; flex-direction: column; gap: 12px; }

    .msg-card {
      background: var(--secondary-dark);
      border: 1px solid rgba(200,169,126,0.08);
      border-radius: 10px;
      padding: 20px;
      transition: border-color 0.2s;
    }

    .msg-card.unread { border-left: 3px solid var(--gold); }
    .msg-card:hover { border-color: rgba(200,169,126,0.2); }

    .msg-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }

    .msg-sender { display: flex; align-items: center; gap: 12px; }
    .msg-sender .material-icons { color: var(--gold); font-size: 22px; }
    .msg-sender strong { display: block; color: var(--text-light); font-size: 0.95rem; }
    .msg-email { color: var(--text-muted); font-size: 0.8rem; }

    .msg-meta { display: flex; align-items: center; gap: 12px; }
    .msg-date { color: var(--text-dim); font-size: 0.8rem; }
    .msg-actions { display: flex; gap: 4px; }

    .icon-btn { padding: 5px; background: rgba(200,169,126,0.1); border: none; border-radius: 6px; cursor: pointer; }
    .icon-btn .material-icons { font-size: 18px; color: var(--text-muted); }
    .icon-btn:hover .material-icons { color: var(--gold); }
    .icon-btn.danger:hover .material-icons { color: var(--danger); }

    .msg-phone { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px; }
    .msg-phone .material-icons { font-size: 16px; color: var(--gold); }

    .msg-body { color: var(--text-light); font-size: 0.9rem; line-height: 1.6; background: var(--tertiary-dark); padding: 12px 16px; border-radius: 6px; }

    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state .material-icons { font-size: 48px; color: var(--text-dim); margin-bottom: 10px; }
  `]
})
export class MessagesMgmtComponent implements OnInit {
  private admin = inject(AdminService);
  messages = signal<ContactMessage[]>([]);

  unread(): number {
    return this.messages().filter(m => !m.isRead).length;
  }

  ngOnInit() { this.load(); }
  load() { this.admin.getMessages().subscribe(d => this.messages.set(d)); }

  markRead(id: number) {
    this.admin.markMessageRead(id).subscribe(() => this.load());
  }

  deleteMsg(id: number) {
    if (confirm('¿Eliminar este mensaje?'))
      this.admin.deleteMessage(id).subscribe(() => this.load());
  }
}

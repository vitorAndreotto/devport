import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (notification(); as n) {
      <div class="toast toast--{{ n.type }}" (click)="dismiss(n.id)">
        <lucide-icon [name]="iconFor(n.type)" [size]="16"></lucide-icon>
        <span class="toast__message">{{ n.message }}</span>
        <button class="toast__close">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
      </div>
    }
  `,
  styles: [`
    :host { position: fixed; top: 1rem; right: 1rem; z-index: 9999; }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      color: #fff;
      font-size: 0.875rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      animation: slideIn 0.25s ease-out;
      max-width: 400px;
    }

    .toast--success { background: #16a34a; }
    .toast--error { background: #dc2626; }
    .toast--info { background: #2563eb; }

    .toast__message { flex: 1; }
    .toast__close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      display: flex;
    }
    .toast__close:hover { opacity: 1; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);

  readonly notification = this.notificationService.current;

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'check';
      case 'error': return 'x';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }
}

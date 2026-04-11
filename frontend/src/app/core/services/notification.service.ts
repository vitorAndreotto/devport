import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

const TOAST_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly notifications = signal<Notification[]>([]);

  readonly current = computed(() => this.notifications().at(0) ?? null);

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  dismiss(id: number): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private add(message: string, type: NotificationType): void {
    const id = ++this.nextId;
    this.notifications.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }
}

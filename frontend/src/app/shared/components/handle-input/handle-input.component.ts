import { Component, inject, input, output, signal, OnInit, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { DevProfileService } from '../../../core/services/dev-profile.service';

export type HandleStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
export type HandleCheckFn = (handle: string) => Observable<boolean>;

@Component({
  selector: 'app-handle-input',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './handle-input.component.html',
  styleUrl: './handle-input.component.scss',
})
export class HandleInputComponent implements OnInit {
  control = input.required<FormControl<string | null>>();
  checkFn = input<HandleCheckFn | null>(null);
  statusChange = output<HandleStatus>();

  private readonly profileService = inject(DevProfileService);
  private readonly destroyRef = inject(DestroyRef);

  status = signal<HandleStatus>('idle');

  private readonly handlePattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

  ngOnInit(): void {
    this.control().addValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(40),
      Validators.pattern(this.handlePattern),
    ]);
  }

  onFocus(): void {
    this.status.set('idle');
    this.statusChange.emit('idle');
  }

  onBlur(): void {
    const value = this.control().value?.trim().toLowerCase() ?? '';
    this.control().setValue(value, { emitEvent: false });

    if (!value || value.length < 3 || !this.handlePattern.test(value)) {
      this.status.set('invalid');
      this.statusChange.emit('invalid');
      return;
    }

    this.status.set('checking');
    this.statusChange.emit('checking');

    const check = this.checkFn() ?? ((h: string) => this.profileService.checkHandle(h));

    check(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((available) => {
        const newStatus: HandleStatus = available ? 'available' : 'taken';
        this.status.set(newStatus);
        this.statusChange.emit(newStatus);
      });
  }

  get previewUrl(): string {
    const value = this.control().value?.trim().toLowerCase() ?? '';
    return value ? `devport.app/${value}` : 'devport.app/seu-handle';
  }
}

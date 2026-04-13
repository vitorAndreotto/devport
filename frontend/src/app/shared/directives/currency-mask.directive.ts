import { Directive, HostListener, ElementRef, inject, OnInit, DestroyRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
  private readonly control = inject(NgControl);
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly destroyRef = inject(DestroyRef);
  private skipNextChange = false;

  ngOnInit(): void {
    // Observa mudanças programáticas (patchValue/setValue)
    this.control.control?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.skipNextChange) {
          this.skipNextChange = false;
          return;
        }

        if (value === null || value === undefined || value === '') return;

        const str = String(value);
        // Se o valor parece ser número puro (do backend), formata
        if (/^\d+(\.\d+)?$/.test(str)) {
          const num = parseFloat(str);
          if (!isNaN(num)) {
            const formatted = this.formatCurrency(num);
            this.setValueSilently(formatted);
          }
        }
      });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatWhileTyping(input.value);
    this.setValueSilently(formatted);
    input.value = formatted;
  }

  @HostListener('blur')
  onBlur(): void {
    const raw = this.control.control?.value ?? '';
    if (!raw) return;

    const numeric = this.toNumber(raw);
    if (numeric !== null) {
      const formatted = this.formatCurrency(numeric);
      this.setValueSilently(formatted);
      this.el.nativeElement.value = formatted;
    }
  }

  private setValueSilently(value: string): void {
    this.skipNextChange = true;
    this.control.control?.setValue(value, { emitEvent: true });
  }

  private formatWhileTyping(value: string): string {
    let cleaned = value.replace(/[^\d,]/g, '');

    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }

    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + ',' + parts[1].substring(0, 2);
    }

    const intPart = parts[0].replace(/\./g, '');
    if (intPart.length > 3) {
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      cleaned = parts.length === 2 ? formatted + ',' + parts[1] : formatted;
    }

    return cleaned;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private toNumber(value: string): number | null {
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
}

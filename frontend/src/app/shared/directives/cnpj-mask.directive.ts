import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCnpjMask]',
  standalone: true,
})
export class CnpjMaskDirective {
  private readonly control = inject(NgControl);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 14) {
      value = value.substring(0, 14);
    }

    // 00.000.000/0000-00
    if (value.length > 12) {
      value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5, 8) + '/' + value.substring(8, 12) + '-' + value.substring(12);
    } else if (value.length > 8) {
      value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5, 8) + '/' + value.substring(8);
    } else if (value.length > 5) {
      value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5);
    } else if (value.length > 2) {
      value = value.substring(0, 2) + '.' + value.substring(2);
    }

    this.control.control?.setValue(value, { emitEvent: false });
    input.value = value;
  }
}

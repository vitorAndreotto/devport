import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  label = input.required<string>();
  control = input.required<AbstractControl>();
  type = input<string>('text');
  placeholder = input<string>('');
  mask = input<string>('');

  get showError(): boolean {
    const ctrl = this.control();
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  get errorMessage(): string {
    const errors = this.control().errors;
    if (!errors) return '';

    if (errors['required']) return `${this.label()} é obrigatório.`;
    if (errors['email']) return 'E-mail inválido.';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['passwordMismatch']) return 'As senhas não coincidem.';

    return 'Campo inválido.';
  }
}

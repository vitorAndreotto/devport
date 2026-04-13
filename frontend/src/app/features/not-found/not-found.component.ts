import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="not-found">
      <lucide-icon name="compass" [size]="64"></lucide-icon>
      <h1>404</h1>
      <p>Navio à deriva! Essa rota não existe nos nossos mapas.</p>
      <a routerLink="/" class="not-found__link">
        <lucide-icon name="anchor" [size]="18"></lucide-icon>
        Voltar ao porto
      </a>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
      color: var(--navy-600);

      ::ng-deep lucide-icon { display: flex; margin-bottom: 1rem; }

      h1 {
        font-size: 3rem;
        font-weight: 800;
        color: var(--navy-950);
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 1.125rem;
        margin-bottom: 2rem;
      }

      &__link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--navy-900);
        color: white;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: background 0.2s;
        &:hover { background: var(--navy-800); }
        ::ng-deep lucide-icon { display: flex; margin-bottom: 0; }
      }
    }
  `],
})
export class NotFoundComponent {}

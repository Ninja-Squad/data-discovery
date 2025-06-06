import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { NavbarComponent } from './navbar/navbar.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../environments/footer.default';

@Component({
  selector: 'dd-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, ErrorComponent, RouterOutlet, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly i18nReady = toSignal(
    inject(TranslateService)
      .get('navbar.more')
      .pipe(
        map(() => true),
        catchError(() => of(true))
      )
  );

  constructor() {
    const title = inject(Title);
    title.setTitle(environment.title);
  }
}

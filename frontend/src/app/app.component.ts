import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'dd-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [NavbarComponent, ErrorComponent, RouterOutlet, AsyncPipe, environment.footerComponent]
})
export class AppComponent {
  private translateService = inject(TranslateService);

  i18nReady$: Observable<boolean>;

  constructor() {
    const title = inject(Title);

    title.setTitle(environment.title);

    // we just want to make sure the translations are loaded. Whether the key exists of not doesn't actually matter
    this.i18nReady$ = this.translateService.get('navbar.more').pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }
}

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'dd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  i18nReady$: Observable<boolean>;

  constructor(
    title: Title,
    private translateService: TranslateService
  ) {
    title.setTitle(environment.title);

    // we just want to make sure the translations are loaded. Whether the key exists of not doesn't actually matter
    this.i18nReady$ = this.translateService.get('navbar.more').pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }
}

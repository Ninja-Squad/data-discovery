import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';
import { filter, map, merge, Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';

/**
 * Component which displays the errors emitted by the error-interceptor service, until the user navigates elsewhere
 */
@Component({
  selector: 'dd-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule, AsyncPipe]
})
export class ErrorComponent {
  error$: Observable<HttpError | null>;

  constructor(
    private router: Router,
    private errorInterceptor: ErrorInterceptorService
  ) {
    this.error$ = merge(
      this.errorInterceptor.getErrors(),
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => null)
      )
    );
  }
}

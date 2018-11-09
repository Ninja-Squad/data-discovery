import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';
import { merge, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Component which displays the errors emitted by the error-interceptor service, until the user navigates elsewhere
 */
@Component({
  selector: 'dd-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  error$: Observable<HttpError | null>;

  constructor(private router: Router,
              private errorInterceptor: ErrorInterceptorService) {
    this.error$ =
      merge(
        this.errorInterceptor.getErrors(),
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => null)
        )
      );
  }
}

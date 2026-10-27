import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateDirective } from '@ngx-translate/core';
import { delay, filter, map, merge } from 'rxjs';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';

/**
 * Component which displays the errors emitted by the error-interceptor service, until the user navigates elsewhere
 */
@Component({
  selector: 'dd-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  imports: [TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {
  readonly error: Signal<HttpError | undefined> = toSignal(
    merge(
      inject(ErrorInterceptorService).getErrors(),
      inject(Router).events.pipe(
        filter(event => event instanceof NavigationEnd),
        map((): undefined => undefined)
      )
    ).pipe(
      // add delay to properly show errors caused by toSignal
      delay<HttpError | undefined>(1)
    )
  );
}

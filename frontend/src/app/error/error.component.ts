import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';
import { delay, filter, map, merge } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Component which displays the errors emitted by the error-interceptor service, until the user navigates elsewhere
 */
@Component({
  selector: 'dd-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {
  readonly error: Signal<HttpError | undefined> = toSignal(
    merge(
      inject(ErrorInterceptorService).getErrors(),
      inject(Router).events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => undefined)
      )
    ).pipe(
      // add delay to properly show errors caused by toSignal
      delay<HttpError | undefined>(1)
    )
  );
}

import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ErrorComponent } from './error.component';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';
import { provideI18nTesting } from '../i18n/mock-18n';

class ErrorComponentTester {
  constructor() {
    TestBed.createComponent(ErrorComponent);
  }
  readonly error = page.getByCss('.error');
  readonly status = page.getByCss('#error-status');
  readonly message = page.getByCss('#error-message');
}

describe('ErrorComponent', () => {
  let tester: ErrorComponentTester;
  let routerEvents: Subject<RouterEvent>;
  let httpErrors: Subject<HttpError>;

  beforeEach(async () => {
    routerEvents = new Subject<RouterEvent>();
    httpErrors = new Subject<HttpError>();

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: Router, useValue: { events: routerEvents } }]
    });

    const errorInterceptorService = TestBed.inject(ErrorInterceptorService);
    vi.spyOn(errorInterceptorService, 'getErrors').mockReturnValue(httpErrors);

    tester = new ErrorComponentTester();
  });

  test('should not display any error initially', async () => {
    await expect.element(tester.error).not.toBeInTheDocument();
  });

  test('should display an error when it is emitted, and hide it when navigation succeeds', async () => {
    httpErrors.next({
      status: 500,
      message: 'Oulala'
    });

    await expect.element(tester.error).toHaveTextContent('Unexpected error occurred.');
    await expect.element(tester.status).toHaveTextContent('Status: 500');
    await expect.element(tester.message).toHaveTextContent('Message: Oulala');

    httpErrors.next({
      status: null,
      message: null
    });

    await expect.element(tester.error).toHaveTextContent('Unexpected error occurred.');
    await expect.element(tester.status).not.toBeInTheDocument();
    await expect.element(tester.message).not.toBeInTheDocument();

    routerEvents.next(new NavigationStart(1, 'foo', null));
    await expect.element(tester.error).toBeInTheDocument();

    routerEvents.next(new NavigationEnd(1, 'foo', null));
    await expect.element(tester.error).not.toBeInTheDocument();
  });
});

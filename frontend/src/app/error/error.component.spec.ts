import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { ComponentTester } from 'ngx-speculoos';

import { ErrorComponent } from './error.component';
import { ErrorInterceptorService, HttpError } from '../error-interceptor.service';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

class ErrorComponentTester extends ComponentTester<ErrorComponent> {
  constructor() {
    super(ErrorComponent);
  }

  get error() {
    return this.element('.error');
  }

  get status() {
    return this.element('#error-status');
  }

  get message() {
    return this.element('#error-message');
  }
}

describe('ErrorComponent', () => {
  let tester: ErrorComponentTester;

  let routerEvents: Subject<RouterEvent>;
  let httpErrors: Subject<HttpError>;

  beforeEach(() => {
    routerEvents = new Subject<RouterEvent>();
    httpErrors = new Subject<HttpError>();

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: Router, useValue: { events: routerEvents } }]
    });

    const errorInterceptorService = TestBed.inject(ErrorInterceptorService);
    spyOn(errorInterceptorService, 'getErrors').and.returnValue(httpErrors);

    jasmine.clock().install();

    tester = new ErrorComponentTester();
    tester.detectChanges();
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should not display any error initially', () => {
    jasmine.clock().tick(1);
    expect(tester.error).toBeNull();
  });

  it('should display an error when it is emitted, and hide it when navigation succeeds', () => {
    httpErrors.next({
      status: 500,
      message: 'Oulala'
    });
    jasmine.clock().tick(1);
    tester.detectChanges();

    expect(tester.error).toContainText('Unexpected error occurred.');
    expect(tester.status).toContainText('Status: 500');
    expect(tester.message).toContainText('Message: Oulala');

    httpErrors.next({
      status: null,
      message: null
    });
    jasmine.clock().tick(1);
    tester.detectChanges();

    expect(tester.error).toContainText('Unexpected error occurred.');
    expect(tester.status).toBeNull();
    expect(tester.message).toBeNull();

    routerEvents.next(new NavigationStart(1, 'foo', null));
    jasmine.clock().tick(1);
    tester.detectChanges();
    expect(tester.error).not.toBeNull();

    routerEvents.next(new NavigationEnd(1, 'foo', null));
    jasmine.clock().tick(1);
    tester.detectChanges();
    expect(tester.error).toBeNull();
  });
});

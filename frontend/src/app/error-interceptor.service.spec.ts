import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { beforeEach, describe, expect, test } from 'vitest';
import { errorInterceptor, ErrorInterceptorService, HttpError } from './error-interceptor.service';

describe('ErrorInterceptorService', () => {
  let service: ErrorInterceptorService;
  let http: HttpTestingController;
  let httpClient: HttpClient;
  const noop = () => {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ErrorInterceptorService);
    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  test('should emit error when error is not an HTTP response', () => {
    let error: HttpError;
    service.getErrors().subscribe(err => {
      error = err;
    });

    httpClient.get('/test').subscribe({ error: noop });
    http.expectOne('/test').error(new ProgressEvent('unknown'));

    expect(error!.status).toBe(0);
  });

  test('should emit error when error is an HTTP response', () => {
    let error: HttpError;
    service.getErrors().subscribe(err => {
      error = err;
    });

    httpClient.get('/test').subscribe({ error: noop });
    http.expectOne('/test').flush(null, { status: 500, statusText: 'Server Error' });

    expect(error!.status).toBe(500);
    expect(error!.message).toBe('Http failure response for /test: 500 Server Error');
  });
});

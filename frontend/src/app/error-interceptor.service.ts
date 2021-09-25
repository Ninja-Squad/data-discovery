import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

export interface HttpError {
  status: number | null;
  message: string;
}

/**
 * An HTTP interceptor that detects error responses and emits them, so that the errors component can display
 * a toast to signal the error.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService implements HttpInterceptor {
  private errorSubject = new Subject<HttpError>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(tap({ error: err => this.errorSubject.next(this.toError(err)) }));
  }

  private toError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      return {
        status: null,
        message: errorResponse.error.message
      };
    } else {
      // The backend returned an unsuccessful response code.
      return {
        status: errorResponse.status,
        message: errorResponse.message
      };
    }
  }

  getErrors(): Observable<HttpError> {
    return this.errorSubject.asObservable();
  }
}

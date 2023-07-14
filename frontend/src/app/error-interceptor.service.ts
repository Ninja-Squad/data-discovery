import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export interface HttpError {
  status: number | null;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {
  private errorSubject = new Subject<HttpError>();

  getErrors(): Observable<HttpError> {
    return this.errorSubject.asObservable();
  }

  error(error: HttpError) {
    this.errorSubject.next(error);
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorInterceptorService = inject(ErrorInterceptorService);

  return next(req).pipe(
    tap({
      error: (errorResponse: HttpErrorResponse) => {
        if (errorResponse.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          errorInterceptorService.error({
            status: null,
            message: errorResponse.error.message
          });
        } else {
          // The backend returned an unsuccessful response code.
          errorInterceptorService.error({
            status: errorResponse.status,
            message: errorResponse.message
          });
        }
      }
    })
  );
};

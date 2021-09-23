import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private http: HttpClient) {}

  export(params: { [key: string]: string | string[] }): Observable<Blob> {
    return this.http.get('api/germplasms/export', { params, responseType: 'blob' });
  }
}

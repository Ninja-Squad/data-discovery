import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AggregationCriterion } from '../models/aggregation-criterion';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private http: HttpClient) {}

  export(
    query: string,
    aggregationCriteria: Array<AggregationCriterion>,
    descendants: boolean
  ): Observable<Blob> {
    const params: { [key: string]: string | number | Array<string> | boolean } = {
      query: query ?? '',
      descendants
    };

    aggregationCriteria.forEach(criterion => (params[criterion.name] = criterion.values));
    return this.http.get('api/germplasms/export', { params, responseType: 'blob' });
  }
}

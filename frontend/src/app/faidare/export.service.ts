import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private http = inject(HttpClient);

  export(
    criteria: {
      query: string;
      aggregationCriteria: Array<AggregationCriterion>;
      descendants: boolean;
    },
    exportType: 'mcpd' | 'plant-material'
  ): Observable<Blob> {
    const params: { [key: string]: string | number | Array<string> | boolean } = {
      query: criteria.query ?? '',
      descendants: criteria.descendants
    };

    criteria.aggregationCriteria.forEach(criterion => (params[criterion.name] = criterion.values));
    return this.http.get(`api/germplasms/exports/${exportType}`, {
      params,
      responseType: 'blob'
    });
  }
}

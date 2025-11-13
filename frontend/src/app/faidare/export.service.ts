import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { Observable } from 'rxjs';

export const EXPORT_TYPES = ['plant-material', 'mcpd', 'miappe-excel', 'miappe-csv'] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

interface ExportEndpoint {
  slug: string;
  format?: 'CSV' | 'EXCEL';
}
const EXPORT_ENDPOINTS: Record<ExportType, ExportEndpoint> = {
  'plant-material': {
    slug: 'plant-material'
  },
  mcpd: {
    slug: 'mcpd'
  },
  'miappe-excel': {
    slug: 'miappe',
    format: 'EXCEL'
  },
  'miappe-csv': {
    slug: 'miappe',
    format: 'CSV'
  }
};

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
    exportType: ExportType
  ): Observable<Blob> {
    const params: Record<string, string | number | ReadonlyArray<string> | boolean> = {
      query: criteria.query ?? '',
      descendants: criteria.descendants
    };

    criteria.aggregationCriteria.forEach(criterion => (params[criterion.name] = criterion.values));

    const endpoint = EXPORT_ENDPOINTS[exportType];
    if (endpoint.format) {
      params['format'] = endpoint.format;
    }

    return this.http.get(`api/germplasms/exports/${endpoint.slug}`, {
      params,
      responseType: 'blob'
    });
  }
}

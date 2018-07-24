import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GeneticResourceModel } from './models/genetic-resource.model';
import { Page } from './models/page';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) {}

  search(query: string): Observable<Page<GeneticResourceModel>> {
    return this.http.get<Page<GeneticResourceModel>>('/api/genetic-resources', {
      params: { query }
    });
  }

}

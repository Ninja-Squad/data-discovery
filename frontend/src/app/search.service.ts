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

  search(query: string, pageAsNumber: number): Observable<Page<GeneticResourceModel>> {
    // we decrease the page as the frontend is 1 based, and the backend 0 based.
    const page = (pageAsNumber - 1).toString();
    return this.http.get<Page<GeneticResourceModel>>('/api/genetic-resources', {
      params: { query, page }
    });
  }

}

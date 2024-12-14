import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PillarModel } from './models/pillar.model';

@Injectable({
  providedIn: 'root'
})
export class PillarService {
  private http = inject(HttpClient);

  list(): Observable<Array<PillarModel>> {
    return this.http.get<Array<PillarModel>>('api/pillars');
  }
}

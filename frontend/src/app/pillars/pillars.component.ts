import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'dd-pillars',
  templateUrl: './pillars.component.html',
  styleUrls: ['./pillars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillarsComponent implements OnInit {

  pillars$: Observable<Array<PillarModel>>;
  environment: any;

  constructor(private pillarService: PillarService) {
    this.environment = environment;
  }

  ngOnInit() {
    this.pillars$ = this.pillarService.list();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class PillarsComponent {

  pillars$: Observable<Array<PillarModel>>;
  environment: any;

  constructor(private pillarService: PillarService) {
    this.environment = environment;
    this.pillars$ = this.pillarService.list();
  }
}

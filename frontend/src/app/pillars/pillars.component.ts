import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';

@Component({
  selector: 'rare-pillars',
  templateUrl: './pillars.component.html',
  styleUrls: ['./pillars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillarsComponent implements OnInit {

  pillars$: Observable<Array<PillarModel>>;

  constructor(private pillarService: PillarService) { }

  ngOnInit() {
    this.pillars$ = this.pillarService.list();
  }
}

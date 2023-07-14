import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';
import { environment } from '../../environments/environment';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
  selector: 'dd-pillars',
  templateUrl: './pillars.component.html',
  styleUrls: ['./pillars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, TranslateModule, NgFor, DocumentCountComponent, AsyncPipe]
})
export class PillarsComponent {
  pillars$: Observable<Array<PillarModel>>;
  environment: any;

  constructor(private pillarService: PillarService) {
    this.environment = environment;
    this.pillars$ = this.pillarService.list();
  }
}

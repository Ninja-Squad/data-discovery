import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PillarService } from '../pillar.service';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dd-pillars',
  templateUrl: './pillars.component.html',
  styleUrl: './pillars.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DocumentCountComponent]
})
export class PillarsComponent {
  readonly pillars = toSignal(inject(PillarService).list());
}

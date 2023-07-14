import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgPlural, NgPluralCase, NgIf, DecimalPipe } from '@angular/common';

@Component({
  selector: 'dd-document-count',
  templateUrl: './document-count.component.html',
  styleUrls: ['./document-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgPlural, NgPluralCase, TranslateModule, NgIf, NgbTooltip, DecimalPipe]
})
export class DocumentCountComponent {
  @Input() name = '';
  @Input() url = '';
  @Input() count = 0;
  @Input() muted = true;
}

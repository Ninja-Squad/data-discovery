import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgPlural, NgPluralCase, DecimalPipe } from '@angular/common';

@Component({
  selector: 'dd-document-count',
  templateUrl: './document-count.component.html',
  styleUrl: './document-count.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgPlural, NgPluralCase, TranslateModule, NgbTooltip, DecimalPipe]
})
export class DocumentCountComponent {
  readonly name = input('');
  readonly url = input('');
  readonly count = input(0);
  readonly muted = input(true);
}

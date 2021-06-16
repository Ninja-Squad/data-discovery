import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'dd-document-count',
  templateUrl: './document-count.component.html',
  styleUrls: ['./document-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentCountComponent {

  @Input() name = '';
  @Input() url = '';
  @Input() count = 0;
  @Input() muted = true;

}

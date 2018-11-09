import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'dd-document-count',
  templateUrl: './document-count.component.html',
  styleUrls: ['./document-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentCountComponent {

  @Input() name: string;
  @Input() url: string;
  @Input() count: number;
  @Input() muted = true;

}

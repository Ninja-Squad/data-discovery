import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';

@Component({
  selector: 'dd-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent {
  @Input() node!: TypedNodeDetails;
}

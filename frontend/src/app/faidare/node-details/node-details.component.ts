import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';
import { NgFor, NgIf } from '@angular/common';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dd-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, OntologyNodeTypeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent {
  @Input() node!: TypedNodeDetails;

  isUrl(value: string) {
    return value.startsWith('http://') || value.startsWith('https://');
  }
}

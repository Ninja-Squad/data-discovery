import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { TypedNodeDetails } from '../ontology.model';

@Component({
  selector: 'dd-node-details',
  templateUrl: './node-details.component.html',
  styleUrl: './node-details.component.scss',
  imports: [TranslateDirective, OntologyNodeTypeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent {
  readonly node = input.required<TypedNodeDetails>();

  isUrl(value: string) {
    return value.startsWith('http://') || value.startsWith('https://');
  }
}

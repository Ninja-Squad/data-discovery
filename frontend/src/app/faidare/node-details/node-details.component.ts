import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';

import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'dd-node-details',
    templateUrl: './node-details.component.html',
    styleUrl: './node-details.component.scss',
    imports: [TranslateModule, OntologyNodeTypeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent {
  @Input() node!: TypedNodeDetails;

  isUrl(value: string) {
    return value.startsWith('http://') || value.startsWith('https://');
  }
}

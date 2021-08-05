import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OntologyNodeType } from '../../ontology.service';

@Component({
  selector: 'dd-ontology-node-type',
  templateUrl: './ontology-node-type.component.html',
  styleUrls: ['./ontology-node-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyNodeTypeComponent {
  @Input() type!: OntologyNodeType;
}

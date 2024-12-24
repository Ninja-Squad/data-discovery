import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OntologyNodeType } from '../../ontology.service';
import { NgClass } from '@angular/common';
import { TranslateDirective } from '@ngx-translate/core';

@Component({
  selector: 'dd-ontology-node-type',
  templateUrl: './ontology-node-type.component.html',
  styleUrl: './ontology-node-type.component.scss',
  imports: [NgClass, TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyNodeTypeComponent {
  readonly type = input.required<OntologyNodeType>();
}

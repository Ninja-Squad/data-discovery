import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OntologyNodeType } from '../../ontology.service';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dd-ontology-node-type',
  templateUrl: './ontology-node-type.component.html',
  styleUrl: './ontology-node-type.component.scss',
  standalone: true,
  imports: [NgClass, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyNodeTypeComponent {
  @Input() type!: OntologyNodeType;
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { RareGeneticResourceModel } from '../rare-genetic-resource.model';

@Component({
  selector: 'rare-genetic-resource',
  templateUrl: './rare-genetic-resource.component.html',
  styleUrls: ['./rare-genetic-resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareGeneticResourceComponent {

  @Input() geneticResource: RareGeneticResourceModel;

}

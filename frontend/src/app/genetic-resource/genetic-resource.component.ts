import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { GeneticResourceModel } from '../models/genetic-resource.model';

@Component({
  selector: 'rare-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneticResourceComponent {

  descriptionCollapsed = true;

  @Input() geneticResource: GeneticResourceModel;

  toggleDescription() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

}

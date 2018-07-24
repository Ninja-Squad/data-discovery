import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Page } from '../models/page';
import { GeneticResourceModel } from '../models/genetic-resource.model';

@Component({
  selector: 'rare-genetic-resources',
  templateUrl: './genetic-resources.component.html',
  styleUrls: ['./genetic-resources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneticResourcesComponent {

  @Input() geneticResources: Page<GeneticResourceModel>;

}

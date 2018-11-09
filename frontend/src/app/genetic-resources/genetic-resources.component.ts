import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Page } from '../models/page';
import { GeneticResourceModel } from '../models/genetic-resource.model';

@Component({
  selector: 'dd-genetic-resources',
  templateUrl: './genetic-resources.component.html',
  styleUrls: ['./genetic-resources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneticResourcesComponent {

  @Input() geneticResources: Page<GeneticResourceModel>;

  get firstResultIndex() {
    return (this.geneticResources.number * this.geneticResources.size) + 1;
  }

  get lastResultIndex() {
    return this.firstResultIndex + this.geneticResources.content.length - 1;
  }

  get resultLimited() {
    return this.geneticResources.totalElements > this.geneticResources.maxResults;
  }
}

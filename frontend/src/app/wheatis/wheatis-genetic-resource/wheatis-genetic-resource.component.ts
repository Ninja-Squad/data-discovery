import { Component, Input } from '@angular/core';

import { WheatisGeneticResourceModel } from '../wheatis-genetic-resource.model';

@Component({
  selector: 'dd-genetic-resource',
  templateUrl: './wheatis-genetic-resource.component.html',
  styleUrls: ['./wheatis-genetic-resource.component.scss']
})
export class WheatisGeneticResourceComponent {

  @Input() geneticResource: WheatisGeneticResourceModel;

}

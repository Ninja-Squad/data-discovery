import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { GeneticResourceModel } from '../models/genetic-resource.model';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'rare-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneticResourceComponent implements OnInit {

  descriptionCollapsed = true;

  @Input() geneticResource: GeneticResourceModel;
  truncatedDescription: string;

  constructor(private highlightService: HighlightService) { }

  toggleDescription() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

  ngOnInit() {
    this.truncatedDescription = this.highlightService.truncate(this.geneticResource.description, 256);
  }
}

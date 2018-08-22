import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'rare-truncatable-description',
  templateUrl: './truncatable-description.component.html',
  styleUrls: ['./truncatable-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TruncatableDescriptionComponent implements OnInit {

  @Input() description: string;

  descriptionCollapsed = true;

  truncatedDescription: string;

  constructor(private highlightService: HighlightService) { }

  toggleDescription() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

  ngOnInit() {
    this.truncatedDescription = this.highlightService.truncate(this.description, 256);
  }

}

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { HighlightService } from '../highlight.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'dd-truncatable-description',
    templateUrl: './truncatable-description.component.html',
    styleUrl: './truncatable-description.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule]
})
export class TruncatableDescriptionComponent implements OnInit {
  @Input() description = '';

  descriptionCollapsed = true;

  truncatedDescription = '';

  constructor(private highlightService: HighlightService) {}

  toggleDescription() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

  ngOnInit() {
    this.truncatedDescription = this.highlightService.truncate(this.description, 256, 100);
  }
}

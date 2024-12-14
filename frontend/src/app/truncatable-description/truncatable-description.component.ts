import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
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
  private highlightService = inject(HighlightService);

  readonly description = input('');

  descriptionCollapsed = true;

  truncatedDescription = '';

  toggleDescription() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

  ngOnInit() {
    this.truncatedDescription = this.highlightService.truncate(this.description(), 256, 100);
  }
}

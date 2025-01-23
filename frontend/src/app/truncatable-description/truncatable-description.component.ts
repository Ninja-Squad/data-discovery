import { ChangeDetectionStrategy, Component, inject, input, signal, computed } from '@angular/core';
import { HighlightService } from '../highlight.service';
import { TranslateDirective } from '@ngx-translate/core';

@Component({
  selector: 'dd-truncatable-description',
  templateUrl: './truncatable-description.component.html',
  styleUrl: './truncatable-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateDirective]
})
export class TruncatableDescriptionComponent {
  private readonly highlightService = inject(HighlightService);
  readonly description = input('');
  readonly descriptionCollapsed = signal(true);
  readonly truncatedDescription = computed(() =>
    this.highlightService.truncate(this.description(), 256, 100)
  );

  toggleDescription() {
    this.descriptionCollapsed.update(collapsed => !collapsed);
  }
}

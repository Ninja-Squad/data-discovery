import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
import { Sort } from '../germplasm-results.component';
import { SortCriterion } from '../../../search-state.service';

@Component({
  selector: 'th[sortable]',
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortableHeaderComponent {
  readonly sortable = input.required<Sort>();
  readonly criterion = input<SortCriterion | null>(null);

  readonly sorted = output<SortCriterion>();

  onSort(): void {
    const criterion = this.criterion();
    this.sorted.emit({
      sort: this.sortable(),
      direction:
        this.sortable() === criterion?.sort
          ? criterion.direction === 'desc'
            ? 'asc'
            : 'desc'
          : 'asc'
    });
  }
}

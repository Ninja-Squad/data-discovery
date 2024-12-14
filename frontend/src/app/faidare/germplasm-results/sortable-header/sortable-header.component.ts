import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { Sort } from '../germplasm-results.component';
import { SortCriterion } from '../../../search-state.service';

@Component({
  selector: 'th[sortable]',
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortableHeaderComponent {
  @Input() sortable!: Sort;
  @Input() criterion: SortCriterion | null = null;

  readonly sorted = output<SortCriterion>();

  onSort(): void {
    this.sorted.emit({
      sort: this.sortable,
      direction:
        this.sortable === this.criterion?.sort
          ? this.criterion.direction === 'desc'
            ? 'asc'
            : 'desc'
          : 'asc'
    });
  }
}

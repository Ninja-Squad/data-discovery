import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Direction, Sort } from '../germplasm-results.component';

@Component({
  selector: 'th[sortable]',
  templateUrl: './sortable-header.component.html',
  styleUrls: ['./sortable-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortableHeaderComponent {
  @Input() sortable!: Sort;
  @Input() sort: Sort | null | undefined;
  @Input() direction: Direction | null | undefined;

  @Output() sorted = new EventEmitter<{ sort: Sort; direction: Direction }>();

  onSort(): void {
    this.sorted.emit({
      sort: this.sortable,
      direction: this.sortable === this.sort ? (this.direction === 'desc' ? 'asc' : 'desc') : 'asc'
    });
  }
}

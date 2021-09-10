import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dd-descendants-checkbox',
  templateUrl: './descendants-checkbox.component.html',
  styleUrls: ['./descendants-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescendantsCheckboxComponent {
  @Input() searchDescendants = false;
  @Output() searchDescendantsChange = new EventEmitter();

  /**
   * Listen to checkBox status and change it accordingly
   * but always keep the selected criteria
   **/
  onDescendantsChecked(checked: boolean) {
    this.searchDescendants = checked;
    this.searchDescendantsChange.emit(this.searchDescendants);
  }
}

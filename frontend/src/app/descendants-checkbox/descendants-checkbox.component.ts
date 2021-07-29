import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'dd-descendants-checkbox',
  templateUrl: './descendants-checkbox.component.html',
  styleUrls: ['./descendants-checkbox.component.scss']
})
export class DescendantsCheckboxComponent implements OnInit {
  @Input() searchDescendants = false;
  @Output() searchDescendantsChange = new EventEmitter();

  ngOnInit() {
    this.searchDescendantsChange.emit(this.searchDescendants);
  }

  /**
   * Listen to checkBox status and change it accordingly
   * but always keep the selected criteria
   **/
  onDescendantsChecked(checked: boolean) {
    this.searchDescendants = checked;
    this.searchDescendantsChange.emit(this.searchDescendants);
  }
}

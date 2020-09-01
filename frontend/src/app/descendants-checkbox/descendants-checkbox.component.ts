import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'dd-descendants-checkbox',
  templateUrl: './descendants-checkbox.component.html',
  styleUrls: ['./descendants-checkbox.component.scss']
})
export class DescendantsCheckboxComponent implements OnInit {

  @Input() searchDescendants: boolean;
  @Output() searchDescendantsChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.searchDescendantsChange.emit(this.searchDescendants);
  }

  /**
   * Listen to checkBox status and change it accordingly
   * but always keep the selected criteria
   **/
  onDescendantsChecked(e: any) {
    this.searchDescendants = e.target.checked;
    this.searchDescendantsChange.emit(this.searchDescendants);
  }

}

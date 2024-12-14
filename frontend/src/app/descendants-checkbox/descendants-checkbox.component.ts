import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'dd-descendants-checkbox',
    templateUrl: './descendants-checkbox.component.html',
    styleUrl: './descendants-checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, NgbTooltip]
})
export class DescendantsCheckboxComponent {
  @Input() searchDescendants = false;
  readonly searchDescendantsChange = output<boolean>();

  /**
   * Listen to checkBox status and change it accordingly
   * but always keep the selected criteria
   **/
  onDescendantsChecked(checked: boolean) {
    this.searchDescendants = checked;
    this.searchDescendantsChange.emit(this.searchDescendants);
  }
}

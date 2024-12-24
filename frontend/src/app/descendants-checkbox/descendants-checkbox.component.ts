import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dd-descendants-checkbox',
  templateUrl: './descendants-checkbox.component.html',
  styleUrl: './descendants-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateDirective, TranslatePipe, NgbTooltip]
})
export class DescendantsCheckboxComponent {
  readonly searchDescendants = model(false);

  /**
   * Listen to checkBox status and change it accordingly
   * but always keep the selected criteria
   **/
  onDescendantsChecked(checked: boolean) {
    this.searchDescendants.set(checked);
  }
}

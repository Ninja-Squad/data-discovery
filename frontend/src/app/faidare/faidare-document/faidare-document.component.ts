import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { TranslateModule } from '@ngx-translate/core';

interface ViewModel {
  document: FaidareDocumentModel;
  isBasketEnabled: boolean;
  selectedForOrdering: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './faidare-document.component.html',
  styleUrl: './faidare-document.component.scss',
  imports: [TranslateModule, NgbTooltip, TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentComponent {
  private basketService = inject(BasketService);

  readonly document = input.required<FaidareDocumentModel>();

  readonly vm: Signal<ViewModel> = computed(() => {
    const isBasketEnabled = this.basketService.isEnabled();
    const selectedForOrdering =
      isBasketEnabled && this.basketService.isAccessionInBasket(this.document());
    return {
      document: this.document(),
      isBasketEnabled,
      selectedForOrdering
    };
  });

  addToBasket(document: FaidareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: FaidareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

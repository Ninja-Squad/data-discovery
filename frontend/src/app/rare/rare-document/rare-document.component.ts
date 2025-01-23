import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

interface ViewModel {
  document: RareDocumentModel;
  isBasketEnabled: boolean;
  selectedForOrdering: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './rare-document.component.html',
  styleUrl: './rare-document.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbTooltip, TruncatableDescriptionComponent, TranslatePipe]
})
export class RareDocumentComponent {
  private readonly basketService = inject(BasketService);

  readonly document = input.required<RareDocumentModel>();
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

  addToBasket(document: RareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: RareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

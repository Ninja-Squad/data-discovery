import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { BasketItem, BasketService } from '../../urgi-common/basket/basket.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { TranslatePipe } from '@ngx-translate/core';
import { BasketAdapter } from '../../urgi-common/basket/basket-adapter.service';

interface ViewModel {
  document: FaidareDocumentModel;
  basketItem: BasketItem | null;
  isInBasket: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './faidare-document.component.html',
  styleUrl: './faidare-document.component.scss',
  imports: [TranslatePipe, NgbTooltip, TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentComponent {
  private readonly basketService = inject(BasketService);
  private readonly basketAdapter = inject(BasketAdapter);

  readonly document = input.required<FaidareDocumentModel>();

  readonly vm: Signal<ViewModel> = computed(() => {
    const isBasketEnabled = this.basketService.isEnabled();
    const basketItem = isBasketEnabled ? this.basketAdapter.asBasketItem(this.document()) : null;
    const isInBasket = !!basketItem && this.basketService.isItemInBasket(basketItem);
    return {
      document: this.document(),
      basketItem,
      isInBasket
    };
  });

  addToBasket() {
    this.basketService.addToBasket(this.vm().basketItem!);
  }

  removeFromBasket() {
    this.basketService.removeFromBasket(this.vm().basketItem!);
  }
}

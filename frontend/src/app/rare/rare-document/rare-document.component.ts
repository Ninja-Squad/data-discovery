import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketItem, BasketService } from '../../urgi-common/basket/basket.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { BasketAdapter } from '../../urgi-common/basket/basket-adapter.service';

interface ViewModel {
  document: RareDocumentModel;
  basketItem: BasketItem | null;
  isInBasket: boolean;
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
  private readonly basketAdapter = inject(BasketAdapter);

  readonly document = input.required<RareDocumentModel>();

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

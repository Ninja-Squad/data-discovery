import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { BasketItem, BasketService } from '../basket.service';
import { TranslateDirective } from '@ngx-translate/core';
import { Page } from '../../../models/page';
import { DocumentModel } from '../../../models/document.model';
import { BasketAdapter } from '../basket-adapter.service';

interface ViewModel {
  items: Array<BasketItem>;
  allInBasket: boolean;
}

@Component({
  selector: 'dd-select-all-results',
  templateUrl: './select-all-results.component.html',
  styleUrl: './select-all-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateDirective]
})
export class SelectAllResultsComponent {
  private readonly basketAdapter = inject(BasketAdapter);
  private readonly basketService = inject(BasketService);

  readonly documents = input.required<Page<DocumentModel>>();
  readonly vm: Signal<ViewModel> = computed(() => {
    const documents = this.documents();
    const items: Array<BasketItem> = documents.content
      .map(document => this.basketAdapter.asBasketItem(document))
      .filter(item => !!item);
    return {
      items,
      allInBasket: items.length > 0 && items.every(item => this.basketService.isItemInBasket(item))
    };
  });

  addAllToBasket() {
    this.vm().items.forEach(item => this.basketService.addToBasket(item));
  }

  removeAllFromBasket() {
    this.vm().items.forEach(item => this.basketService.removeFromBasket(item));
  }
}

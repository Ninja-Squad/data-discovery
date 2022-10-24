import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { map, Observable, of, ReplaySubject, switchMap } from 'rxjs';

interface ViewModel {
  document: RareDocumentModel;
  isBasketEnabled: boolean;
  selectedForOrdering: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './rare-document.component.html',
  styleUrls: ['./rare-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareDocumentComponent {
  private documentSubject = new ReplaySubject<RareDocumentModel>();
  vm$: Observable<ViewModel>;

  constructor(private basketService: BasketService) {
    this.vm$ = this.documentSubject.pipe(
      switchMap(document => {
        const isBasketEnabled = basketService.isEnabled();
        const selectedForOrdering$ = isBasketEnabled
          ? basketService.isAccessionInBasket(document)
          : of(false);
        return selectedForOrdering$.pipe(
          map(selectedForOrdering => ({
            document,
            isBasketEnabled,
            selectedForOrdering
          }))
        );
      })
    );
  }

  @Input()
  set document(document: RareDocumentModel) {
    this.documentSubject.next(document);
  }

  addToBasket(document: RareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: RareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

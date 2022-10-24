import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { map, Observable, of, ReplaySubject, switchMap } from 'rxjs';

interface ViewModel {
  document: FaidareDocumentModel;
  isBasketEnabled: boolean;
  selectedForOrdering: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './faidare-document.component.html',
  styleUrls: ['./faidare-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentComponent {
  private documentSubject = new ReplaySubject<FaidareDocumentModel>();
  vm$: Observable<ViewModel>;

  constructor(private basketService: BasketService) {
    this.vm$ = this.documentSubject.pipe(
      switchMap(document => {
        console.log(document.accessionHolder);
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
  set document(document: FaidareDocumentModel) {
    this.documentSubject.next(document);
  }

  addToBasket(document: FaidareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: FaidareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

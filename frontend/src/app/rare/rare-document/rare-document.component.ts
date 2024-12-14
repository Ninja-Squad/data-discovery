import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  imports: [NgbTooltip, TruncatableDescriptionComponent, TranslateModule]
})
export class RareDocumentComponent {
  private basketService = inject(BasketService);

  readonly document = input.required<RareDocumentModel>();
  readonly vm: Signal<ViewModel | undefined> = toSignal(
    toObservable(this.document).pipe(
      switchMap(document => {
        const isBasketEnabled = this.basketService.isEnabled();
        const selectedForOrdering$ = isBasketEnabled
          ? this.basketService.isAccessionInBasket(document)
          : of(false);
        return selectedForOrdering$.pipe(
          map(selectedForOrdering => ({
            document,
            isBasketEnabled,
            selectedForOrdering
          }))
        );
      })
    )
  );

  addToBasket(document: RareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: RareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

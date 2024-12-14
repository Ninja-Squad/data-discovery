import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { TranslateModule } from '@ngx-translate/core';
import { toObservable } from '@angular/core/rxjs-interop';

interface ViewModel {
  document: FaidareDocumentModel;
  isBasketEnabled: boolean;
  selectedForOrdering: boolean;
}

@Component({
  selector: 'dd-document',
  templateUrl: './faidare-document.component.html',
  styleUrl: './faidare-document.component.scss',
  imports: [AsyncPipe, TranslateModule, NgbTooltip, TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentComponent {
  private basketService = inject(BasketService);

  readonly document = input.required<FaidareDocumentModel>();

  readonly vm$: Observable<ViewModel>;

  constructor() {
    this.vm$ = toObservable(this.document).pipe(
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
    );
  }

  addToBasket(document: FaidareDocumentModel) {
    this.basketService.addToBasket(document);
  }

  removeFromBasket(document: FaidareDocumentModel) {
    this.basketService.removeFromBasket(document.identifier);
  }
}

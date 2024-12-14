import { Component, inject } from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal, NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LOCATION } from '../../../location.service';

@Component({
  selector: 'dd-basket',
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss',
  imports: [NgPlural, NgPluralCase, DecimalPipe, TranslateModule, ReactiveFormsModule, NgbTooltip]
})
export class BasketComponent {
  private basketService = inject(BasketService);
  private modalService = inject(NgbModal);

  itemCounter = 0;
  basket: Basket | null = null;
  eulaAgreementControl = inject(NonNullableFormBuilder).control(false, Validators.requiredTrue);
  submitted = false;
  confirmForbidden = false;
  isEnabled = false;

  private location = inject(LOCATION);

  constructor() {
    this.isEnabled = this.basketService.isEnabled();
    if (this.isEnabled) {
      this.basketService
        .getBasket()
        .pipe(takeUntilDestroyed())
        .subscribe((basket: Basket | null) => {
          this.basket = basket;
          if (basket) {
            this.itemCounter = basket.items.length;
          }
        });
    }
  }

  viewItems(basket: any) {
    if (this.itemCounter > 0) {
      this.modalService
        .open(basket, { ariaLabelledBy: 'modal-title', size: 'lg', scrollable: true })
        .result.then(
          () => {
            // trigger an sendBasket on rare-basket
            this.basketService.sendBasket().subscribe(basketCreated => {
              this.location.assign(`${environment.basket.url}/baskets/${basketCreated.reference}`);
            });
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {}
        );
    }
  }

  removeItemFromBasket(item: string) {
    this.basketService.removeFromBasket(item);
  }

  sendBasket(modal: NgbModalRef) {
    this.submitted = true;
    // the EULA agreement is mandatory
    if (this.eulaAgreementControl.invalid) {
      this.confirmForbidden = true;
      timer(350).subscribe(() => (this.confirmForbidden = false));
    } else {
      modal.close('order');
    }
  }

  clearBasket() {
    this.basketService.clearBasket();
  }
}

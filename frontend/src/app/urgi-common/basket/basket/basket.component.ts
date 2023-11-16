import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal, NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { LOCATION } from '../../../location.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe, NgFor, NgIf, NgPlural, NgPluralCase } from '@angular/common';

@Component({
  selector: 'dd-basket',
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgPlural,
    NgPluralCase,
    DecimalPipe,
    TranslateModule,
    ReactiveFormsModule,
    NgbTooltip
  ]
})
export class BasketComponent implements OnInit, OnDestroy {
  itemCounter = 0;
  basket: Basket | null = null;
  eulaAgreementControl = this.fb.control(false, Validators.requiredTrue);
  submitted = false;
  confirmForbidden = false;
  isEnabled = false;

  private basketSubscription?: Subscription;

  constructor(
    private basketService: BasketService,
    private modalService: NgbModal,
    private fb: NonNullableFormBuilder,
    @Inject(LOCATION) private location: Location
  ) {}

  ngOnInit(): void {
    this.isEnabled = this.basketService.isEnabled();
    if (this.isEnabled) {
      this.basketSubscription = this.basketService
        .getBasket()
        .subscribe((basket: Basket | null) => {
          this.basket = basket;
          if (basket) {
            this.itemCounter = basket.items.length;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.basketSubscription?.unsubscribe();
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

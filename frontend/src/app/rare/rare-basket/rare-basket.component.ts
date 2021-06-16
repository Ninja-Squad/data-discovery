import { Component, Inject, OnInit } from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LOCATION } from '../rare.module';
import { rareBasket } from '../../../environments/rare-no-basket';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { timer } from 'rxjs';

@Component({
  // the selector is not a custom element as usual
  // but a simple div, so we can add it in the navbar
  // without disturbing the other applications.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div.navbar-rare-basket',
  templateUrl: './rare-basket.component.html',
  styleUrls: ['./rare-basket.component.scss']
})
export class RareBasketComponent implements OnInit {
  itemCounter = 0;
  basket: Basket | null = null;
  eulaAgreementControl!: FormControl;
  submitted = false;
  confirmForbidden = false;
  isEnabled = false;

  constructor(
    private basketService: BasketService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    @Inject(LOCATION) private location: Location
  ) {}

  ngOnInit(): void {
    this.isEnabled = this.basketService.isEnabled();
    if (this.isEnabled) {
      this.basketService.getBasket().subscribe((basket: Basket | null) => {
        this.basket = basket;
        if (basket) {
          this.itemCounter = basket.items.length;
        }
      });
      this.eulaAgreementControl = this.fb.control(false, Validators.requiredTrue);
    }
  }

  viewItems(basket: any) {
    if (this.itemCounter > 0) {
      this.modalService.open(basket, { ariaLabelledBy: 'modal-title', size: 'lg', scrollable: true }).result.then(
        () => {
          // trigger an sendBasket on rare-basket
          this.basketService.sendBasket().subscribe(basketCreated => {
            this.location.assign(`${rareBasket.url}/baskets/${basketCreated.reference}`);
          });
        },
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

import { Component, Inject, OnInit } from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LOCATION } from '../rare.module';
import { rareBasket } from '../../../environments/rare-basket';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { timer } from 'rxjs';

@Component({
  // the selector is not a custom element as usual
  // but a simple div, so we can add it in the navbar
  // without disturbing the other applications.
  // tslint:disable-next-line:component-selector
  selector: 'div.navbar-rare-basket',
  templateUrl: './rare-basket.component.html',
  styleUrls: ['./rare-basket.component.scss']
})
export class RareBasketComponent implements OnInit {
  itemCounter = 0;
  basket: Basket;
  eulaAgreementControl: FormControl;
  submitted = false;
  confirmForbidden = false;
  isEnabled: boolean;

  constructor(
    private basketService: BasketService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    @Inject(LOCATION) private location: Location
  ) {}

  ngOnInit(): void {
    this.isEnabled = this.basketService.isEnabled();
    if (this.isEnabled) {
      this.basketService.getBasket().subscribe((basket: Basket) => {
        this.itemCounter = basket.items.length;
        this.basket = basket;
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

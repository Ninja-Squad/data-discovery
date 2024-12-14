import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  TemplateRef
} from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal, NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LOCATION } from '../../../location.service';

@Component({
  selector: 'dd-basket',
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss',
  imports: [NgPlural, NgPluralCase, DecimalPipe, TranslateModule, ReactiveFormsModule, NgbTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketComponent {
  private basketService = inject(BasketService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  isEnabled = this.basketService.isEnabled();
  basket: Signal<Basket | null> = this.isEnabled
    ? toSignal(this.basketService.getBasket(), { initialValue: null })
    : signal(null);
  itemCounter = computed(() => {
    const basket = this.basket();
    return basket ? basket.items.length : 0;
  });
  eulaAgreementControl = inject(NonNullableFormBuilder).control(false, Validators.requiredTrue);
  submitted = signal(false);
  confirmForbidden = signal(false);

  private location = inject(LOCATION);

  viewItems(basket: TemplateRef<unknown>) {
    if (this.itemCounter() > 0) {
      const modalRef = this.modalService.open(basket, {
        ariaLabelledBy: 'modal-title',
        size: 'lg',
        scrollable: true
      });
      modalRef.closed
        .pipe(
          switchMap(() => this.basketService.sendBasket()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(basketCreated =>
          this.location.assign(`${environment.basket.url}/baskets/${basketCreated.reference}`)
        );
    }
  }

  removeItemFromBasket(item: string) {
    this.basketService.removeFromBasket(item);
  }

  sendBasket(modal: NgbModalRef) {
    this.submitted.set(true);
    // the EULA agreement is mandatory
    if (this.eulaAgreementControl.invalid) {
      this.confirmForbidden.set(true);
      timer(350)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.confirmForbidden.set(false));
    } else {
      modal.close('order');
    }
  }

  clearBasket() {
    this.basketService.clearBasket();
  }
}

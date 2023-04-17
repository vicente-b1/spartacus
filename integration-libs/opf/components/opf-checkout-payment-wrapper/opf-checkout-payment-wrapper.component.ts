/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { UserIdService } from '@spartacus/core';
import {
  OpfCheckoutFacade,
  OpfOtpFacade,
  PaymentSessionData,
} from '@spartacus/opf/root';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'cx-opf-checkout-payment-wrapper',
  templateUrl: './opf-checkout-payment-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpfCheckoutPaymentWrapperComponent implements OnInit {
  @Input() selectedPaymentId: number;

  paymentData$: Observable<PaymentSessionData>;

  protected activeCartId: string;

  constructor(
    protected opfCheckoutService: OpfCheckoutFacade,
    protected opfOtpService: OpfOtpFacade,
    protected userIdService: UserIdService,
    protected activeCartService: ActiveCartService
  ) {}

  // TODO: Move this logic to the service
  initiatePayment(): Observable<PaymentSessionData> {
    return combineLatest([
      this.userIdService.getUserId(),
      this.activeCartService.getActiveCartId(),
    ]).pipe(
      switchMap(([userId, cartId]) => {
        this.activeCartId = cartId;
        return this.opfOtpService.generateOtpKey(userId, cartId);
      }),
      filter((response) => Boolean(response?.value)),
      map(({ value: otpKey }) => ({
        otpKey,
        config: {
          configurationId: String(this.selectedPaymentId),
          cartId: this.activeCartId,
          // TODO: Move below as a part of a whole OPF configuration?
          resultURL:
            'http://localhost:4200/electronics-spa/en/USD/checkout/review-order',
          cancelURL:
            'http://localhost:4200/electronics-spa/en/USD/checkout/review-order',
        },
      })),
      switchMap((params) => this.opfCheckoutService.initiatePayment(params))
    );
  }

  ngOnInit() {
    this.paymentData$ = this.initiatePayment();
  }
}

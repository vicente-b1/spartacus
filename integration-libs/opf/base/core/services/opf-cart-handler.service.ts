/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, inject } from '@angular/core';
import {
  ActiveCartFacade,
  Cart,
  DeleteCartFailEvent,
  DeleteCartSuccessEvent,
  DeliveryMode,
  MultiCartFacade,
} from '@spartacus/cart/base/root';
import {
  CheckoutBillingAddressFacade,
  CheckoutDeliveryAddressFacade,
  CheckoutDeliveryModesFacade,
} from '@spartacus/checkout/base/root';
import {
  Address,
  AuthService,
  EMAIL_PATTERN,
  EventService,
  OCC_USER_ID_GUEST,
  QueryState,
  UserAddressService,
  UserIdService,
} from '@spartacus/core';
import { OpfGlobalMessageService } from '@spartacus/opf/base/root';
import { EMPTY, Observable, merge, of, throwError } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OpfCartHandlerService {
  protected activeCartFacade = inject(ActiveCartFacade);
  protected checkoutDeliveryModesFacade = inject(CheckoutDeliveryModesFacade);
  protected checkoutDeliveryAddressFacade = inject(
    CheckoutDeliveryAddressFacade
  );
  protected userAddressService = inject(UserAddressService);
  protected multiCartFacade = inject(MultiCartFacade);
  protected userIdService = inject(UserIdService);
  protected eventService = inject(EventService);
  protected checkoutBillingAddressFacade = inject(CheckoutBillingAddressFacade);
  protected opfGlobalMessageService = inject(OpfGlobalMessageService);
  protected authFacade = inject(AuthService);

  EMAIL_PLACEHOLDER = 'EMAIL_PLACEHOLDER';

  addProductToCart(
    productCode: string,
    quantity: number,
    pickupStore?: string | undefined
  ): Observable<boolean> {
    this.activeCartFacade.addEntry(productCode, quantity, pickupStore);

    this.addGuestTempEmail();

    return this.checkStableCart();
  }

  checkStableCart(): Observable<boolean> {
    return this.activeCartFacade.isStable().pipe(
      filter((isStable) => !!isStable),
      take(1)
    );
  }

  getSupportedDeliveryModes(): Observable<DeliveryMode[]> {
    return this.checkoutDeliveryModesFacade.getSupportedDeliveryModes();
  }

  setDeliveryAddress(address: Address): Observable<string> {
    this.opfGlobalMessageService.disableGlobalMessage([
      'addressForm.userAddressAddSuccess',
    ]);
    return this.checkoutDeliveryAddressFacade
      .createAndSetAddress({ ...address, visibleInAddressBook: false })
      .pipe(
        switchMap(() => this.checkStableCart()),
        switchMap(() =>
          this.getDeliveryAddress().pipe(
            map((addr: Address | undefined) => addr?.id ?? '')
          )
        )
      );
  }

  setBillingAddress(address: Address): Observable<boolean> {
    return this.checkoutBillingAddressFacade
      .setBillingAddress({ ...address, visibleInAddressBook: false })
      .pipe(switchMap(() => this.checkStableCart()));
  }

  getDeliveryAddress(): Observable<Address | undefined> {
    return this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      filter((state: QueryState<Address | undefined>) => !state.loading),
      take(1),
      map((state: QueryState<Address | undefined>) => {
        return state.data;
      })
    );
  }

  getCurrentCart(): Observable<Cart> {
    return this.activeCartFacade.takeActive();
  }

  getCurrentCartId(): Observable<string> {
    return this.activeCartFacade.takeActiveCartId();
  }

  getCurrentCartTotalPrice(): Observable<number | undefined> {
    return this.activeCartFacade
      .getActive()
      .pipe(map((cart: Cart) => cart.totalPrice?.value));
  }

  setDeliveryMode(mode: string): Observable<DeliveryMode | undefined> {
    return this.checkoutDeliveryModesFacade.setDeliveryMode(mode).pipe(
      switchMap(() =>
        this.checkoutDeliveryModesFacade.getSelectedDeliveryModeState()
      ),
      filter(
        (state: QueryState<DeliveryMode | undefined>) =>
          !state.error && !state.loading
      ),
      take(1),
      map((state: QueryState<DeliveryMode | undefined>) => state.data)
    );
  }

  getSelectedDeliveryMode(): Observable<DeliveryMode | undefined> {
    return this.checkoutDeliveryModesFacade.getSelectedDeliveryModeState().pipe(
      filter(
        (state: QueryState<DeliveryMode | undefined>) =>
          !state.error && !state.loading
      ),
      take(1),
      map((state: QueryState<DeliveryMode | undefined>) => state.data)
    );
  }

  deleteUserAddresses(addrIds: string[]): void {
    console.log('deleteUserAddresses', addrIds);
    // this.opfGlobalMessageService.disableGlobalMessage([
    //   'addressForm.userAddressDeleteSuccess',
    // ]);
    // addrIds.forEach((addrId) => {
    //   this.userAddressService.deleteUserAddress(addrId);
    // });
  }

  deleteCurrentCart(): Observable<boolean> {
    return this.activeCartFacade.getActiveCartId().pipe(
      withLatestFrom(this.userIdService.getUserId()),
      take(1),
      tap(([cartId, userId]: [string, string]) => {
        this.multiCartFacade.deleteCart(cartId, userId);
      }),
      switchMap(() =>
        merge(
          this.eventService.get(DeleteCartSuccessEvent).pipe(map(() => true)),
          this.eventService.get(DeleteCartFailEvent).pipe(map(() => false))
        ).pipe(take(1))
      ),
      catchError((error) => {
        console.log('error in deleteCurrentCart', error);
        return throwError(error);
      })
    );
  }

  addGuestTempEmail(email?: string): void {
    this.isAnonymousUser()
      .pipe(
        switchMap((isAnnonymous) => {
          if (!isAnnonymous) {
            return EMPTY;
          }
          return this.getCurrentCartId();
        }),
        withLatestFrom(this.userIdService.getUserId()),
        take(1)
      )
      .subscribe({
        next: ([cartId, userId]) => {
          this.multiCartFacade.assignEmail(
            cartId,
            userId,
            email ?? `${this.EMAIL_PLACEHOLDER}_${cartId}@test123.com`
          );
        },
        error: () => {
          console.log('expected as not anonymous');
        },
        complete: () => {
          console.log('complete, expected as not anonymous');
        },
      });
    // this.getCurrentCartId()
    //   .pipe(withLatestFrom(this.userIdService.getUserId()), take(1))
    //   .subscribe(([cartId, userId]) => {
    //     const email = `temp_${cartId}@test123.com`;
    //     this.multiCartFacade.assignEmail(cartId, userId, email);
    //   });
  }

  updateGuestEmail(email: string): void {
    this.isTempEmail()
      .pipe(
        switchMap((isTemp) => {
          if (isTemp) {
            return this.getCurrentCartId();
          }
          return EMPTY;
        }),
        withLatestFrom(this.userIdService.getUserId()),
        take(1)
      )
      .subscribe({
        next: ([cartId, userId]) => {
          this.multiCartFacade.assignEmail(cartId, userId, email);
        },
        error: (error) => {
          console.log('error', error);
        },
      });
  }

  isAnonymousUser() {
    return this.activeCartFacade.isGuestCart().pipe(
      take(1),
      tap((isGuest) => {
        console.log('isGuest', isGuest);
      }),
      switchMap((isGuest) => {
        return isGuest
          ? of(false)
          : this.authFacade
              .isUserLoggedIn()
              .pipe(map((isLoggedIn) => !isLoggedIn));
      }),
      take(1)
    );
  }

  // isGuestCart(cart?: Cart): Observable<boolean> {
  //   return cart
  //     ? of(this.isCartUserGuest(cart))
  //     : this.activeCart$.pipe(
  //         map((activeCart) => this.isCartUserGuest(activeCart)),
  //         distinctUntilChanged()
  //       );
  // }

  isTempEmail(): Observable<boolean> {
    return this.getCurrentCart().pipe(
      map((cart) => {
        return !!cart?.user?.uid?.includes(this.EMAIL_PLACEHOLDER);
      })
    );
  }

  protected isCartUserGuest(cart: Cart): boolean {
    const cartUser = cart.user;
    return Boolean(
      cartUser &&
        (cartUser.name === OCC_USER_ID_GUEST ||
          this.isEmail(cartUser.uid?.split('|').slice(1).join('|')))
    );
  }

  isEmail(str?: string): boolean {
    if (str) {
      return str.match(EMAIL_PATTERN) ? true : false;
    }
    return false;
  }
}

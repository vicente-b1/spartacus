/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { ApplePayService } from './apple-pay.service';
import {
  ApplePayObservableConfig,
  OpfPaymentFacade,
} from '@spartacus/opf/base/root';
import { Product, WindowRef } from '@spartacus/core';
import { OpfCartHandlerService } from '@spartacus/opf/base/core';
import { ApplePayObservableFactory } from './observable/apple-pay-observable.factory';
import { ApplePaySessionFactory } from './apple-pay-session/apple-pay-session.factory';
import { Subject, of, throwError } from 'rxjs';
import { DeliveryMode } from '@spartacus/cart/base/root';
import { map } from 'rxjs/operators';

interface ApplePaySessionVerificationResponse {
  epochTimestamp: number;
  expiresAt: number;
  merchantSessionIdentifier: string;
  nonce: string;
  merchantIdentifier: string;
  domainName: string;
  displayName: string;
  signature: string;
}
const mockApplePaySessionVerificationResponse: ApplePaySessionVerificationResponse =
  {
    epochTimestamp: 123,
    expiresAt: 123,
    merchantSessionIdentifier: '123',
    nonce: '123',
    merchantIdentifier: '123',
    domainName: '123',
    displayName: '123',
    signature: '123',
  };

const mocProduct: Product = {
  name: 'Product Name',
  code: 'PRODUCT_CODE',
  images: {
    PRIMARY: {
      thumbnail: {
        url: 'url',
        altText: 'alt',
      },
    },
  },
  price: {
    formattedValue: '$1.500',
    value: 1.5,
  },
  priceRange: {
    maxPrice: {
      formattedValue: '$1.500',
    },
    minPrice: {
      formattedValue: '$1.000',
    },
  },
};

const mockDeliveryMode: DeliveryMode = {
  code: '01',
  deliveryCost: {
    currencyIso: 'us',
    formattedValue: '$100.00',
    value: 100,
  },
  description: 'UPS ground',
  name: 'UPS',
};

const mockCart = {
  totalPrice: {
    formattedValue: '$1.500',
    value: 1.5,
  },
};

const MockWindowRef = {
  nativeWindow: {
    location: {
      hostname: 'testHost',
    },
  },
};

const mockApplePayPaymentContact: ApplePayJS.ApplePayPaymentContact = {
  givenName: 'mock-first-name',
  familyName: 'mock-last-name',
  addressLines: ['mock-address-line-1'],
  administrativeArea: 'mock-state',
  country: 'mock-country',
  countryCode: 'US',
  emailAddress: 'mock-email',
  locality: 'mock-city',
  phoneNumber: 'mock-phone',
  postalCode: 'mock-postal-code',
};

describe('ApplePayService', () => {
  let service: ApplePayService;
  let opfPaymentServiceMock: jasmine.SpyObj<OpfPaymentFacade>;
  let cartHandlerServiceMock: jasmine.SpyObj<OpfCartHandlerService>;
  let applePayObservableFactoryMock: jasmine.SpyObj<ApplePayObservableFactory>;
  let applePaySessionFactoryMock: jasmine.SpyObj<ApplePaySessionFactory>;
  let applePayObservableTestController: Subject<ApplePayJS.ApplePayPaymentAuthorizationResult>;
  beforeEach(() => {
    applePaySessionFactoryMock = jasmine.createSpyObj(
      'ApplePaySessionFactory',
      ['startApplePaySession']
    );
    opfPaymentServiceMock = jasmine.createSpyObj('OpfPaymentFacade', [
      'submitPayment',
      'getApplePayWebSession',
    ]);
    applePayObservableFactoryMock = jasmine.createSpyObj(
      'ApplePayObservableFactory',
      ['initApplePayEventsHandler']
    );
    cartHandlerServiceMock = jasmine.createSpyObj('OpfCartHandlerService', [
      'deleteCurrentCart',
      'deleteUserAddresses',
      'addProductToCart',
      'checkStableCart',
      'getSupportedDeliveryModes',
      'setDeliveryAddress',
      'setBillingAddress',
      'getDeliveryAddress',
      'getCurrentCart',
      'getCurrentCartId',
      'getCurrentCartTotalPrice',
      'setDeliveryMode',
      'getSelectedDeliveryMode',
      'deleteUserAddresses',
    ]);
    TestBed.configureTestingModule({
      providers: [
        ApplePayService,
        { provide: OpfPaymentFacade, useValue: opfPaymentServiceMock },
        { provide: WindowRef, useValue: MockWindowRef },
        { provide: OpfCartHandlerService, useValue: cartHandlerServiceMock },
        {
          provide: ApplePayObservableFactory,
          useValue: applePayObservableFactoryMock,
        },
        {
          provide: ApplePaySessionFactory,
          useValue: applePaySessionFactoryMock,
        },
      ],
    });
    service = TestBed.inject(ApplePayService);

    applePayObservableTestController = new Subject();
    applePayObservableFactoryMock.initApplePayEventsHandler.and.returnValue(
      applePayObservableTestController
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('observable callbacks', () => {
    let config: ApplePayObservableConfig;
    beforeEach(() => {
      (
        applePayObservableFactoryMock.initApplePayEventsHandler as jasmine.Spy
      ).and.callFake((actualConfig: any) => {
        config = actualConfig;
        return applePayObservableTestController;
      });
    });

    it('should handle validateMerchant change', () => {
      let event: ApplePayJS.ApplePayValidateMerchantEvent;

      event = <ApplePayJS.ApplePayValidateMerchantEvent>{};

      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );

      service.start(mocProduct, 2, 'us').subscribe();
      config.validateMerchant(event).subscribe(() => {});

      expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
      expect(cartHandlerServiceMock.addProductToCart).toHaveBeenCalled();
      expect(cartHandlerServiceMock.getCurrentCartId).toHaveBeenCalled();
    });

    it('should handle shipping address changes', () => {
      let shippingAddressChangeResult: ApplePayJS.ApplePayShippingContactUpdate =
        {
          newLineItems: undefined,
          newTotal: { label: '', amount: '' },
        };
      let event: ApplePayJS.ApplePayShippingContactSelectedEvent;
      event = <ApplePayJS.ApplePayShippingContactSelectedEvent>{
        shippingContact: mockApplePayPaymentContact,
      };
      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.setDeliveryAddress.and.returnValue(
        of('addresId01')
      );
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );
      cartHandlerServiceMock.getSupportedDeliveryModes.and.returnValue(
        of([mockDeliveryMode])
      );
      cartHandlerServiceMock.getCurrentCartTotalPrice.and.returnValue(of(100));

      service.start(mocProduct, 1, 'us').subscribe();
      config
        .validateMerchant(<ApplePayJS.ApplePayValidateMerchantEvent>{})
        .subscribe();
      config
        .shippingContactSelected(event)
        .subscribe((actual) => (shippingAddressChangeResult = actual));

      expect(shippingAddressChangeResult.newShippingMethods?.[0]).toEqual({
        identifier: mockDeliveryMode.code,
        label: mockDeliveryMode.name,
        amount: '100.00',
        detail: mockDeliveryMode.description,
      });
    });

    it('should return the order totals', () => {
      let event: ApplePayJS.ApplePayPaymentMethodSelectedEvent;
      let paymentMethodChangeResult: ApplePayJS.ApplePayPaymentMethodUpdate = {
        newLineItems: undefined,
        newTotal: { amount: '', label: '' },
      };
      const quantity = 1;
      event = <ApplePayJS.ApplePayPaymentMethodSelectedEvent>{
        paymentMethod: {
          displayName: 'Test Visa 1111',
          type: 'credit',
          network: 'Visa',
        },
      };

      service.start(mocProduct, quantity, 'us').subscribe();
      config
        .paymentMethodSelected(event)
        .subscribe((actual) => (paymentMethodChangeResult = actual));

      expect(paymentMethodChangeResult.newTotal).toEqual({
        amount: mocProduct.price?.value?.toString(),
        label: mocProduct.name,
      });
    });

    it('should handle shippingMethodSelected changes', () => {
      let shippingMethodChangeResult: ApplePayJS.ApplePayShippingMethodUpdate =
        {
          newTotal: { amount: '', label: '' },
        };
      let event: ApplePayJS.ApplePayShippingMethodSelectedEvent = <
        ApplePayJS.ApplePayShippingMethodSelectedEvent
      >{
        shippingMethod: {
          identifier: 'mock-shipping-method-id-2',
          amount: '2.00',
          label: 'mock-shipping-method-name-2',
          detail: '',
        },
      };
      cartHandlerServiceMock.setDeliveryMode.and.returnValue(
        of(mockDeliveryMode)
      );
      cartHandlerServiceMock.getCurrentCart.and.returnValue(of(mockCart));

      service.start(mocProduct, 1, 'us').subscribe();
      config
        .shippingMethodSelected(event)
        .subscribe((actural) => (shippingMethodChangeResult = actural));
      expect(shippingMethodChangeResult.newTotal).toEqual({
        amount: mockCart.totalPrice?.value?.toString(),
        label: mocProduct.name,
      });
    });

    it('should handle paymentAuthorized changes', () => {
      let paymentAuthorizedChangeResult: ApplePayJS.ApplePayPaymentAuthorizationResult =
        {
          status: 1,
        };
      let event: ApplePayJS.ApplePayPaymentAuthorizedEvent;
      event = <ApplePayJS.ApplePayPaymentAuthorizedEvent>{
        payment: {
          billingContact: mockApplePayPaymentContact,
          shippingContact: mockApplePayPaymentContact,
          token: {
            paymentData: '',
            paymentMethod: {
              displayName: 'Test Visa 1111',
              type: 'credit',
              network: 'Visa',
            },
            transactionIdentifier: 'identifierId01',
          },
        },
      };

      cartHandlerServiceMock.setDeliveryAddress.and.returnValue(
        of('addresId01')
      );
      cartHandlerServiceMock.getCurrentCart.and.returnValue(of(mockCart));
      cartHandlerServiceMock.setBillingAddress.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.submitPayment.and.returnValue(of(true));

      service.start(mocProduct, 1, 'us').subscribe();
      config
        .paymentAuthorized(event)
        .subscribe((actural) => (paymentAuthorizedChangeResult = actural));

      expect(opfPaymentServiceMock.submitPayment).toHaveBeenCalled();
      expect(paymentAuthorizedChangeResult).toBeTruthy();
      expect(paymentAuthorizedChangeResult?.errors).toBeFalsy;
    });

    it('should handle error on paymentAuthorized changes', () => {
      let paymentAuthorizedChangeResult: ApplePayJS.ApplePayPaymentAuthorizationResult =
        {
          status: 1,
        };
      let event: ApplePayJS.ApplePayPaymentAuthorizedEvent;
      event = <ApplePayJS.ApplePayPaymentAuthorizedEvent>{
        payment: {
          billingContact: mockApplePayPaymentContact,
          shippingContact: mockApplePayPaymentContact,
          token: {
            paymentData: '',
            paymentMethod: {
              displayName: 'Test Visa 1111',
              type: 'credit',
              network: 'Visa',
            },
            transactionIdentifier: 'identifierId01',
          },
        },
      };

      cartHandlerServiceMock.setDeliveryAddress.and.returnValue(
        of('addresId01')
      );
      cartHandlerServiceMock.getCurrentCart.and.returnValue(of(mockCart));
      cartHandlerServiceMock.setBillingAddress.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.submitPayment.and.returnValue(throwError('error'));

      service.start(mocProduct, 1, 'us').subscribe();
      config
        .paymentAuthorized(event)
        .subscribe((actural) => (paymentAuthorizedChangeResult = actural));

      expect(paymentAuthorizedChangeResult?.errors).toBeTruthy();
    });

    it('should call error handler when product code is unknown', () => {
      let event: ApplePayJS.ApplePayValidateMerchantEvent;
      event = <ApplePayJS.ApplePayValidateMerchantEvent>{};
      applePayObservableFactoryMock.initApplePayEventsHandler.and.callFake(
        (config: ApplePayObservableConfig) => {
          return config
            .validateMerchant(event)
            .pipe(map(() => <ApplePayJS.ApplePayPaymentAuthorizationResult>{}));
        }
      );

      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );
      const newmocProduct = { ...mocProduct };
      newmocProduct.code = '';
      service.start(newmocProduct, 2, 'us').subscribe({
        error: () => {},
      });

      expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
      expect(cartHandlerServiceMock.addProductToCart).not.toHaveBeenCalled();
      expect(cartHandlerServiceMock.getCurrentCartId).not.toHaveBeenCalled();
    });

    it('should call error handler when product quntity is 0', () => {
      let event: ApplePayJS.ApplePayValidateMerchantEvent;
      event = <ApplePayJS.ApplePayValidateMerchantEvent>{};
      applePayObservableFactoryMock.initApplePayEventsHandler.and.callFake(
        (config: ApplePayObservableConfig) => {
          return config
            .validateMerchant(event)
            .pipe(map(() => <ApplePayJS.ApplePayPaymentAuthorizationResult>{}));
        }
      );

      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );

      service.start(mocProduct, 0, 'us').subscribe({
        error: () => {},
      });

      expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
      expect(cartHandlerServiceMock.addProductToCart).not.toHaveBeenCalled();
      expect(cartHandlerServiceMock.getCurrentCartId).not.toHaveBeenCalled();
    });

    it('should handle error when supported delivery methods are empty', () => {
      let shippingAddressChangeResult: ApplePayJS.ApplePayShippingContactUpdate =
        {
          newLineItems: undefined,
          newTotal: { label: '', amount: '' },
        };
      let event: ApplePayJS.ApplePayShippingContactSelectedEvent;
      event = <ApplePayJS.ApplePayShippingContactSelectedEvent>{};
      applePayObservableFactoryMock.initApplePayEventsHandler.and.callFake(
        (config: ApplePayObservableConfig) => {
          return config
            .shippingContactSelected(event)
            .pipe(map(() => <ApplePayJS.ApplePayPaymentAuthorizationResult>{}));
        }
      );

      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.setDeliveryAddress.and.returnValue(
        of('addresId01')
      );
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );
      cartHandlerServiceMock.getSupportedDeliveryModes.and.returnValue(of([]));
      cartHandlerServiceMock.getCurrentCartTotalPrice.and.returnValue(of(100));

      service.start(mocProduct, 1, 'us').subscribe({ error: () => {} });

      expect(cartHandlerServiceMock.setDeliveryAddress).toHaveBeenCalled();
      expect(shippingAddressChangeResult.newShippingMethods).toBeFalsy();
    });

    it('should handle error when price is not defined', () => {
      const totalPriceResult = undefined;
      let event: ApplePayJS.ApplePayShippingContactSelectedEvent;
      event = <ApplePayJS.ApplePayShippingContactSelectedEvent>{};
      applePayObservableFactoryMock.initApplePayEventsHandler.and.callFake(
        (config: ApplePayObservableConfig) => {
          return config
            .shippingContactSelected(event)
            .pipe(map(() => <ApplePayJS.ApplePayPaymentAuthorizationResult>{}));
        }
      );

      cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
      cartHandlerServiceMock.setDeliveryAddress.and.returnValue(
        of('addresId01')
      );
      cartHandlerServiceMock.addProductToCart.and.returnValue(of(true));
      cartHandlerServiceMock.getCurrentCartId.and.returnValue(of('cartId01'));
      opfPaymentServiceMock.getApplePayWebSession.and.returnValue(
        of(mockApplePaySessionVerificationResponse)
      );
      cartHandlerServiceMock.getSupportedDeliveryModes.and.returnValue(of([]));
      cartHandlerServiceMock.getCurrentCartTotalPrice.and.returnValue(
        of(totalPriceResult)
      );

      service.start(mocProduct, 0, 'us').subscribe({
        error: () => {},
      });

      expect(cartHandlerServiceMock.setDeliveryAddress).toHaveBeenCalled();
      expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
    });

    it('should handle error when total price value is 0', () => {
      let event: ApplePayJS.ApplePayShippingMethodSelectedEvent;
      event = <ApplePayJS.ApplePayShippingMethodSelectedEvent>{
        shippingMethod: {
          identifier: 'mock-shipping-method-id-2',
          amount: '2.00',
          label: 'mock-shipping-method-name-2',
          detail: '',
        },
      };
      cartHandlerServiceMock.setDeliveryMode.and.returnValue(
        of(mockDeliveryMode)
      );
      const mockCartExt = {
        totalPrice: {
          formattedValue: '0',
          value: 0,
        },
      };
      cartHandlerServiceMock.getCurrentCart.and.returnValue(of(mockCartExt));
      applePayObservableFactoryMock.initApplePayEventsHandler.and.callFake(
        (configx: ApplePayObservableConfig) => {
          return configx
            .shippingMethodSelected(event)
            .pipe(map(() => <ApplePayJS.ApplePayPaymentAuthorizationResult>{}));
        }
      );
      service.start(mocProduct, 1, 'us').subscribe({ error: () => {} });
      expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
    });
  });

  it('should handle errors during Apple Pay session start', () => {
    service = TestBed.inject(ApplePayService);
    cartHandlerServiceMock.deleteCurrentCart.and.returnValue(of(true));
    applePayObservableFactoryMock.initApplePayEventsHandler.and.returnValue(
      throwError('Error')
    );

    service.start(mocProduct, 1, 'us').subscribe({
      error: (err) => {
        expect(err).toBe('Error');
      },
    });
    expect(cartHandlerServiceMock.deleteCurrentCart).toHaveBeenCalled();
  });
});

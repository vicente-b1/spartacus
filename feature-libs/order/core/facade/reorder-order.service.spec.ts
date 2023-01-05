import { inject, TestBed } from '@angular/core/testing';
import { CartModificationList } from '@spartacus/cart/base/root';
import {
  OCC_USER_ID_CURRENT
} from '@spartacus/core';
import { of } from 'rxjs';
import { ReorderOrderConnector } from '../connectors/reorder-order.connector';
import { ReorderOrderService } from './reorder-order.service';

import createSpy = jasmine.createSpy;

const mockUserId = OCC_USER_ID_CURRENT;
const mockOrderId = 'orderID';
const mockCartModificationList: CartModificationList = {
  cartModifications: [],
};

class MockReorderOrderOrderConnector
  implements Partial<ReorderOrderConnector>
{
    reorder = createSpy().and.returnValue(
    of(mockCartModificationList)
  );
}

describe(`ReorderOrderService`, () => {
  let service: ReorderOrderService;
  let connector: ReorderOrderConnector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReorderOrderService,
        {
          provide: ReorderOrderConnector,
          useClass: MockReorderOrderOrderConnector,
        },
      ],
    });

    service = TestBed.inject(ReorderOrderService);
    connector = TestBed.inject(ReorderOrderConnector);
  });

  it(`should inject ReorderOrderService`, inject(
    [ReorderOrderService],
    (
      reorderOrderService: ReorderOrderService
    ) => {
      expect(reorderOrderService).toBeTruthy();
    }
  ));

  describe(`scheduleReplenishmentOrder`, () => {
    it(`should call reorderOrderConnector.reorder`, () => {
      service.reorder(
        mockOrderId,
        mockUserId
      );

      expect(connector.reorder).toHaveBeenCalledWith(
        mockOrderId,
        mockUserId
      );
    });
  });
});

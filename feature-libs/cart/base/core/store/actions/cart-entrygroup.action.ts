/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StateUtils } from '@spartacus/core';
import { MULTI_CART_DATA } from '../multi-cart-state';

export const CART_REMOVE_ENTRYGROUP = '[Cart-entrygroup] Remove EntryGroup';
export const CART_REMOVE_ENTRYGROUP_SUCCESS = '[Cart-entrygroup] Remove EntryGroup Success';
export const CART_REMOVE_ENTRYGROUP_FAIL = '[Cart-entrygroup] Remove EntryGroup Fail';

export class CartRemoveEntryGroup extends StateUtils.EntityProcessesIncrementAction {
  readonly type = CART_REMOVE_ENTRYGROUP;
  constructor(
    public payload: { cartId: string; userId: string; entryGroupNumber: string }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartRemoveEntryGroupSuccess extends StateUtils.EntityProcessesDecrementAction {
  readonly type = CART_REMOVE_ENTRYGROUP_SUCCESS;
  constructor(
    public payload: { userId: string; cartId: string; entryGroupNumber: string }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export class CartRemoveEntryGroupFail extends StateUtils.EntityProcessesDecrementAction {
  readonly type = CART_REMOVE_ENTRYGROUP_FAIL;
  constructor(
    public payload: { error: any; cartId: string; userId: string; entryGroupNumber: string; }
  ) {
    super(MULTI_CART_DATA, payload.cartId);
  }
}

export type CartEntryGroupAction =
  | CartRemoveEntryGroup
  | CartRemoveEntryGroupSuccess
  | CartRemoveEntryGroupFail;

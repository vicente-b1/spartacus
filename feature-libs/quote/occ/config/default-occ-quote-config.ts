/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OccConfig } from '@spartacus/core';

export const defaultOccQuoteConfig: OccConfig = {
  backend: {
    occ: {
      endpoints: {
        getQuotes: 'users/${userId}/quotes',
        createQuote: 'users/${userId}/quotes',
        getQuote:
          'users/${userId}/quotes/${quoteCode}?fields=FULL,expirationTime,previousEstimatedTotal(formattedValue),totalPrice(formattedValue),quoteDiscounts(formattedValue),orderDiscounts(formattedValue),productDiscounts(formattedValue),entries(FULL)',
        editQuote: 'users/${userId}/quotes/${quoteCode}',
        performQuoteAction: 'users/${userId}/quotes/${quoteCode}/action',
        addComment: 'users/${userId}/quotes/${quoteCode}/comments',
        addDiscount: 'users/${userId}/quotes/${quoteCode}/discounts',
        addQuoteEntryComment:
          'users/${userId}/quotes/${quoteCode}/entries/${entryNumber}/comments',
      },
    },
  },
};

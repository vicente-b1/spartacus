/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider } from '@angular/core';
import { LoggingErrorHandler } from './logging-error-handler';
import { MULTI_ERROR_HANDLERS } from './multi-error-handlers';

export function provideMultiErrorHandlers(): Provider[] {
  return [
    {
      provide: MULTI_ERROR_HANDLERS,
      useExisting: LoggingErrorHandler,
      multi: true,
    },
  ];
}

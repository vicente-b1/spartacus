/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ErrorAction } from '../../model/index';
import { EffectsErrorHandlerService } from './effects-error-handler.service';
import { FeatureConfigService } from '../../features-config';

@Injectable()
export class CxErrorHandlerEffect {
  protected actions$ = inject(Actions);
  protected effectErrorHandler = inject(EffectsErrorHandlerService);
  protected featureConfigService = inject(FeatureConfigService);

  error$: Observable<ErrorAction> = createEffect(
    () =>
      this.actions$.pipe(
        filter(this.effectErrorHandler.filterActions),
        tap((errorAction: ErrorAction) => {
          if (this.featureConfigService.isEnabled('strictHttpAndNgrxErrorHandling')) {

            this.effectErrorHandler.handleError(errorAction)
          }
        }),
      ),
    { dispatch: false }
  );
}

/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  ModuleWithProviders,
  NgModule,
  inject,
} from '@angular/core';
import { provideDefaultConfig } from '../config/config-providers';
import { provideFeatureFlagsToFeatureConfig } from './breaking-changes-flags/provide-breaking-changes-flags-to-features-config';
import { FeaturesConfig } from './config/features-config';
import { FeatureLevelDirective } from './directives/feature-level.directive';
import { FeatureDirective } from './directives/feature.directive';
import { FeatureStylesService } from './services/feature-styles.service';

@NgModule({
  declarations: [FeatureLevelDirective, FeatureDirective],
  exports: [FeatureLevelDirective, FeatureDirective],
})
export class FeaturesConfigModule {
  static forRoot(
    defaultLevel = '3.0'
  ): ModuleWithProviders<FeaturesConfigModule> {
    return {
      ngModule: FeaturesConfigModule,
      providers: [
        ...provideFeatureFlagsToFeatureConfig,
        provideDefaultConfig(<FeaturesConfig>{
          features: {
            level: defaultLevel || '*',
          },
        }),
        {
          provide: APP_BOOTSTRAP_LISTENER,
          multi: true,
          useFactory: (): ((compRef: ComponentRef<any>) => void) => {
            const featureStylesService = inject(FeatureStylesService);
            return (compRef: ComponentRef<any>) =>
              featureStylesService.init(compRef);
          },
        },
      ],
    };
  }
}

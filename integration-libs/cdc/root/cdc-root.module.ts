/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_INITIALIZER, NgModule } from '@angular/core';
import {
  CmsConfig,
  Config,
  ConfigInitializerService,
  provideDefaultConfig,
  provideDefaultConfigFactory,
} from '@spartacus/core';
import {  LogoutGuard } from '@spartacus/storefront';
import { lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CdcConsentManagementModule } from './consent-management/cdc-consent.module';
import { defaultCdcRoutingConfig } from './config/default-cdc-routing-config';
import { CDC_CORE_FEATURE, CDC_FEATURE } from './feature-name';
import { CdcLogoutGuard } from './guards/cdc-logout.guard';
import { CdcJsService } from './service/cdc-js.service';
import { cdcInterceptors } from './http-interceptors';
//import { CdcCmsPageGuard } from './guards';

export function cdcJsFactory(
  cdcJsService: CdcJsService,
  configInit: ConfigInitializerService
): () => Promise<Config> {
  return () =>
    lastValueFrom(
      configInit.getStable('context', 'cdc').pipe(
        tap(() => {
          cdcJsService.initialize();
        })
      )
    );
}

export function defaultCdcComponentsConfig(): CmsConfig {
  const config: CmsConfig = {
    featureModules: {
      [CDC_FEATURE]: {
        cmsComponents: ['GigyaRaasComponent'],
      },
      // by default core is bundled together with components
      [CDC_CORE_FEATURE]: CDC_FEATURE,
    },
  };
  return config;
}

@NgModule({
  imports: [CdcConsentManagementModule],
  providers: [
    ...cdcInterceptors,
    provideDefaultConfigFactory(defaultCdcComponentsConfig),
    { provide: LogoutGuard, useExisting: CdcLogoutGuard },
   // { provide: AuthGuard, useExisting: CdcAuthGuard },
    {
      provide: APP_INITIALIZER,
      useFactory: cdcJsFactory,
      deps: [CdcJsService, ConfigInitializerService],
      multi: true,
    },
    // {
    //   provide: BEFORE_CMS_PAGE_GUARD,
    //   useClass: CdcCmsPageGuard,
    //   multi: true,
    // },
    provideDefaultConfig(defaultCdcRoutingConfig),
  ],
})
export class CdcRootModule {}

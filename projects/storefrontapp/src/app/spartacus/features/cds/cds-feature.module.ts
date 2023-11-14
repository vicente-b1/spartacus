/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { CdsConfig, CdsModule } from '@spartacus/cds';
import { provideConfig } from '@spartacus/core';

const cdsConfigs = [

];

@NgModule({
  imports: [CdsModule.forRoot()],
  providers: [
    provideConfig(<CdsConfig>{
      cds: {
        tenant: 'argotest',
        baseUrl: 'https://api.stage.context.cloud.sap',
        endpoints: {
          strategyProducts:
            '/strategy/${tenant}/strategies/${strategyId}/products',
        },
        merchandising: {
          defaultCarouselViewportThreshold: 80,
        },
        profileTag: {
          javascriptUrl:
            'https://tag.static.stage.context.cloud.sap/js/profile-tag.js',
          configUrl:
            'https://tag.static.stage.context.cloud.sap/config/mytenant-main-default',
          allowInsecureCookies: true,
        },
      },
      cdsConfigs,
    }),
  ],
})
export class CdsFeatureModule {}

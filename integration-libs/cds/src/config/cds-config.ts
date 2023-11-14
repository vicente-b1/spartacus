/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Config } from '@spartacus/core';
import { CdsEndpoints } from '../cds-models/cds-endpoints.model';
import { MerchandisingConfig } from './merchandising.config';
import { ProfileTagConfig } from './profile-tag.config';

export interface CdsConfiguration {
  site?: string;

  tenant?: string;
  baseUrl?: string;
  consentTemplateId?: string;
  endpoints?: CdsEndpoints;
  merchandising?: MerchandisingConfig;
  profileTag?: ProfileTagConfig;
}

// export interface CdsConfigurations {
//   cds?: CdsConfiguration;
//   site?: string;
// }

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class CdsConfig {
  cds?: CdsConfiguration;
  cdsConfigs?: CdsConfiguration[];
}

declare module '@spartacus/core' {
  interface Config extends CdsConfig {}
}

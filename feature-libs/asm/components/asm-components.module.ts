/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FeaturesConfigModule,
  I18nModule,
  provideDefaultConfig,
} from '@spartacus/core';
import {
  FormErrorsModule,
  IconModule,
  PasswordVisibilityToggleModule,
} from '@spartacus/storefront';
import { AsmBindCartComponent } from './asm-bind-cart/asm-bind-cart.component';
import { AsmMainUiComponent } from './asm-main-ui/asm-main-ui.component';
import { AsmSessionTimerComponent } from './asm-session-timer/asm-session-timer.component';
import { FormatTimerPipe } from './asm-session-timer/format-timer.pipe';
import { AsmToggleUiComponent } from './asm-toggle-ui/asm-toggle-ui.component';
import { CSAgentLoginFormComponent } from './csagent-login-form/csagent-login-form.component';
import { CustomerEmulationComponent } from './customer-emulation/customer-emulation.component';
import { CustomerSelectionComponent } from './customer-selection/customer-selection.component';
import { defaultAsmLayoutConfig } from './default-asm-layout.config';
import { DotSpinnerComponent } from './dot-spinner/dot-spinner.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    FormErrorsModule,
    PasswordVisibilityToggleModule,
    IconModule,
    FormsModule,
    FeaturesConfigModule,
  ],
  declarations: [
    AsmMainUiComponent,
    CSAgentLoginFormComponent,
    CustomerSelectionComponent,
    AsmSessionTimerComponent,
    FormatTimerPipe,
    CustomerEmulationComponent,
    AsmToggleUiComponent,
    AsmBindCartComponent,
    DotSpinnerComponent,
  ],
  exports: [
    AsmMainUiComponent,
    CSAgentLoginFormComponent,
    CustomerSelectionComponent,
    AsmSessionTimerComponent,
    FormatTimerPipe,
    CustomerEmulationComponent,
    AsmToggleUiComponent,
    AsmBindCartComponent,
    DotSpinnerComponent,
  ],
  providers: [provideDefaultConfig(defaultAsmLayoutConfig)],
})
export class AsmComponentsModule {}

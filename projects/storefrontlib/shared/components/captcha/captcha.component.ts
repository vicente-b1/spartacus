/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { of, Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { CaptchaApiConfig } from './mockCaptcha/config/captcha-api-config';
import { CaptchaProvider } from './captcha.model';

@Component({
  selector: 'cx-captcha',
  templateUrl: './captcha.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptchaComponent implements AfterViewInit, OnDestroy {
  // Emits true if user confirms captcha
  @Output() confirmed = new EventEmitter<boolean>();

  @ViewChild('captcha', { static: false }) captchaRef: ElementRef;

  protected subscription = new Subscription();

  constructor(
    protected config: CaptchaApiConfig,
    protected injector: Injector
  ) {}

  /**
   * Add fields from CaptchaApiConfig. Call backend to get captcha
   * config.
   */
  ngAfterViewInit(): void {
    if (this.config?.captchaProvider) {
      const captchaProvider = this.injector.get<CaptchaProvider>(
        this.config.captchaProvider
      );
      this.subscription.add(
        captchaProvider
          .getCaptchaConfig()
          .pipe(
            concatMap((captchaConfig) => {
              if (captchaConfig?.enabled) {
                return captchaProvider.renderCaptcha({
                  element: this.captchaRef.nativeElement,
                });
              } else {
                return of(null);
              }
            })
          )
          .subscribe(() => {
            this.confirmed.emit(true);
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

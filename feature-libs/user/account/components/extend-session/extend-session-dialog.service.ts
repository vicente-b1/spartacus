import { Injectable, OnDestroy } from '@angular/core';
import { AuthConfig, AuthService, AuthStorageService } from '@spartacus/core';
import { LAUNCH_CALLER, LaunchDialogService } from '@spartacus/storefront';
import {
  EMPTY,
  Subscription,
  combineLatest,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
  timer,
} from 'rxjs';

@Injectable()
export class ExtendSessionDialogService implements OnDestroy {
  protected subscription = new Subscription();

  constructor(
    protected launchDialogService: LaunchDialogService,
    protected authStorageService: AuthStorageService,
    protected authConfig: AuthConfig,
    protected authService: AuthService
  ) {
    this.initialize();
  }

  protected initialize(): void {
    if (!this.isWarningEnabled()) {
      return;
    }

    const warningInterval =
      this.authConfig.authentication?.sessionExpirationWarning?.interval;
    if (warningInterval) {
      this.listenForToken(warningInterval);
    }
  }

  isWarningEnabled(): boolean {
    const config = this.authConfig.authentication?.sessionExpirationWarning;
    return !!config?.enabled;
  }

  openModal(timeLeft: number): void {
    this.launchDialogService.openDialogAndSubscribe(
      LAUNCH_CALLER.EXTEND_SESSION,
      undefined,
      { timeLeft }
    );
  }

  closeModal(reason?: any): void {
    this.launchDialogService.closeDialog(reason);
  }

  protected listenForToken(interval?: number) {
    const tokenSub = combineLatest([
      this.authStorageService
        .getToken()
        .pipe(filter((token) => Boolean(token && token.expires_at))),
      this.authService.isUserLoggedIn(),
    ])
      .pipe(
        distinctUntilChanged(
          ([prevToken, prevIsLoggedIn], [currToken, currIsLoggedIn]) =>
            prevToken.expires_at === currToken.expires_at &&
            prevIsLoggedIn === currIsLoggedIn
        ),
        switchMap(([token, isLoggedIn]) => {
          if (!token.expires_at || !isLoggedIn) {
            return EMPTY;
          }

          const timeLeft =
            new Date(Number(token.expires_at)).getTime() - Date.now();
          let delayTime = timeLeft;
          if (interval) {
            const intervalMs = interval * 1000;
            delayTime =
              intervalMs < timeLeft ? timeLeft - intervalMs : timeLeft;
          }

          return timer(delayTime).pipe(
            tap(() => this.openModal(interval ? interval : timeLeft))
          );
        })
      )
      .subscribe();

    this.subscription.add(tokenSub);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

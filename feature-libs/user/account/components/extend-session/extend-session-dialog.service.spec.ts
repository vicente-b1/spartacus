import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService, AuthStorageService, AuthConfig } from '@spartacus/core';
import { LaunchDialogService, LAUNCH_CALLER } from '@spartacus/storefront';
import { ExtendSessionDialogService } from './extend-session-dialog.service';

describe('ExtendSessionDialogService', () => {
  let service: ExtendSessionDialogService;
  let launchDialogService: jasmine.SpyObj<LaunchDialogService>;
  let authStorageService: jasmine.SpyObj<AuthStorageService>;
  let authService: jasmine.SpyObj<AuthService>;
  let authConfig: AuthConfig;

  beforeEach(() => {
    const launchDialogSpy = jasmine.createSpyObj('LaunchDialogService', [
      'openDialogAndSubscribe',
      'closeDialog',
    ]);
    const authStorageSpy = jasmine.createSpyObj('AuthStorageService', [
      'getToken',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isUserLoggedIn',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ExtendSessionDialogService,
        { provide: LaunchDialogService, useValue: launchDialogSpy },
        { provide: AuthStorageService, useValue: authStorageSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: AuthConfig,
          useValue: {
            authentication: {
              sessionExpirationWarning: { enabled: true, interval: 30 },
            },
          },
        },
      ],
    });

    service = TestBed.inject(ExtendSessionDialogService);
    launchDialogService = TestBed.inject(
      LaunchDialogService
    ) as jasmine.SpyObj<LaunchDialogService>;
    authStorageService = TestBed.inject(
      AuthStorageService
    ) as jasmine.SpyObj<AuthStorageService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authConfig = TestBed.inject(AuthConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should not initialize if warning is disabled', () => {
      authConfig.authentication!.sessionExpirationWarning!.enabled = false;
      (<any>service).initialize();
      expect(authStorageService.getToken).not.toHaveBeenCalled();
    });

    it('should initialize if warning is enabled', () => {
      authConfig.authentication.sessionExpirationWarning.enabled = true;
      const token$ = of({ expires_at: (Date.now() + 5000).toString() });
      authStorageService.getToken.and.returnValue(token$);
      authService.isUserLoggedIn.and.returnValue(of(true));

      (<any>service).initialize();
      expect(authStorageService.getToken).toHaveBeenCalled();
    });
  });

  describe('listenForToken', () => {
    it('should open modal with the correct time left', (done) => {
      const expirationTime = Date.now() + 10000; // 10 seconds from now
      authStorageService.getToken.and.returnValue(
        of({ expires_at: expirationTime.toString() })
      );
      authService.isUserLoggedIn.and.returnValue(of(true));
      authConfig.authentication.sessionExpirationWarning.interval = 5; // 5 seconds

      launchDialogService.openDialogAndSubscribe.and.callFake(
        (caller, context, data) => {
          if (caller === LAUNCH_CALLER.EXTEND_SESSION && data.timeLeft) {
            expect(data.timeLeft).toBe(5000); // 5 seconds interval
            done();
          }
        }
      );

      service.initialize();
    });
  });
});

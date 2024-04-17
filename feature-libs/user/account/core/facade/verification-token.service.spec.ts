import { TestBed } from '@angular/core/testing';
import { CommandService } from '@spartacus/core';
import {
  UserAccountConnector,
  VerificationTokenService,
} from '@spartacus/user/account/core';
import { LoginForm, VerificationToken } from '@spartacus/user/account/root';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

const form: LoginForm = {
  purpose: 'LOGIN',
  loginId: 'mockEmail',
  password: '1234',
};

const verificationToken: VerificationToken = {
  expiresIn: '300',
  tokenId: 'mockTokenId',
};

class MockUserAccountConnector implements Partial<UserAccountConnector> {
  createVerificationToken = createSpy().and.callFake(() =>
    of(verificationToken)
  );
}

describe('VerificationTokenService', () => {
  let service: VerificationTokenService;
  let connector: UserAccountConnector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserAccountConnector, useClass: MockUserAccountConnector },
        CommandService,
        VerificationTokenService,
      ],
    });

    service = TestBed.inject(VerificationTokenService);
    connector = TestBed.inject(UserAccountConnector);
  });

  it('should inject VerificationTokenService', () => {
    expect(service).toBeTruthy();
  });

  describe('create verification token', () => {
    it('should create verification token for given email and password', () => {
      let result: VerificationToken | undefined;
      service
        .createVerificationToken(form)
        .subscribe((data) => {
          result = data;
        })
        .unsubscribe();
      expect(result).toEqual(verificationToken);
      expect(connector.createVerificationToken).toHaveBeenCalledWith(form);
    });
  });
});

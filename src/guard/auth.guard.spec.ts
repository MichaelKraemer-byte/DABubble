import { TestBed } from '@angular/core/testing';
import { AuthGuard } from '../guard/auth.guard';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ChannelService } from '../services/channel/channel.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthenticationService, useValue: {} },
        { provide: ChannelService, useValue: {} },
        { provide: Router, useValue: {} }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { NavigationServiceService } from './navigation-service.service';

describe('NavigationServiceService', () => {
  let service: NavigationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

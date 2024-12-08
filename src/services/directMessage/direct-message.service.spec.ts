import { TestBed } from '@angular/core/testing';

import { DirectMessageService } from '../../services/directMessage/direct-message.service';

describe('DirectMessageService', () => {
  let service: DirectMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MainContentService } from './main-content.service';

describe('MainContentService', () => {
  let service: MainContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

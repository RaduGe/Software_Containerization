import { TestBed } from '@angular/core/testing';

import { RestDataService } from './rest-data.service';

describe('RestDataService', () => {
  let service: RestDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

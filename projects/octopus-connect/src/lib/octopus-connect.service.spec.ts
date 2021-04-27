import { TestBed } from '@angular/core/testing';

import { OctopusConnectService } from './octopus-connect.service';

describe('OctopusConnectService', () => {
  let service: OctopusConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OctopusConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

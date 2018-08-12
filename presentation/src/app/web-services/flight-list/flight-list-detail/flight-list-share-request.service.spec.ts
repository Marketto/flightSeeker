import { TestBed, inject } from '@angular/core/testing';

import { FlightListShareRequestService } from './flight-list-share-request.service';

describe('FlightListShareRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightListShareRequestService]
    });
  });

  it('should be created', inject([FlightListShareRequestService], (service: FlightListShareRequestService) => {
    expect(service).toBeTruthy();
  }));
});

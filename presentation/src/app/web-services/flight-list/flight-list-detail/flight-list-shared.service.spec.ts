import { TestBed, inject } from '@angular/core/testing';

import { FlightListSharedService } from './flight-list-shared.service';

describe('FlightListSharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightListSharedService]
    });
  });

  it('should be created', inject([FlightListSharedService], (service: FlightListSharedService) => {
    expect(service).toBeTruthy();
  }));
});

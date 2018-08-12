import { TestBed, inject } from '@angular/core/testing';

import { FlightListFlightService } from './flight-list-flight.service';

describe('FlightListFlightService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightListFlightService]
    });
  });

  it('should be created', inject([FlightListFlightService], (service: FlightListFlightService) => {
    expect(service).toBeTruthy();
  }));
});

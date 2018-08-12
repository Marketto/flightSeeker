import { TestBed, inject } from '@angular/core/testing';

import { FlightListDetailService } from './flight-list-detail.service';

describe('FlightListDetailService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightListDetailService]
    });
  });

  it('should be created', inject([FlightListDetailService], (service: FlightListDetailService) => {
    expect(service).toBeTruthy();
  }));
});

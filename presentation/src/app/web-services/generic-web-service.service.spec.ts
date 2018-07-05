import { TestBed, inject } from '@angular/core/testing';

import { GenericWebServiceService } from './generic-web-service.service';

describe('GenericWebServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericWebServiceService]
    });
  });

  it('should be created', inject([GenericWebServiceService], (service: GenericWebServiceService) => {
    expect(service).toBeTruthy();
  }));
});

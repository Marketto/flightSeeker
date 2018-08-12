import { Injectable } from '@angular/core';
import { GenericWebServiceService } from '../../generic-web-service.service';
import { Observable } from '../../../../../node_modules/rxjs';
import { FlightList } from '../../../classes/flight-list/flight-list';
import { FlightListFlightService } from './flight-list-flight.service';
import { FlightListSharedService } from './flight-list-shared.service';
import { FlightListShareRequestService } from './flight-list-share-request.service';

@Injectable({
  providedIn: 'root'
})
export class FlightListDetailService {
  private get resourceURI(): string {
    return `${this.serviceURI}/${this.flightListSlug}`;
  }

  public read(): Observable<FlightList> {
    return this.genericWebService.read<FlightList>(
      this.resourceURI,
      (data: any) => new FlightList(data)
    );
  }

  public flight(flightUUID?: string): FlightListFlightService {
    return new FlightListFlightService(this.genericWebService, this.resourceURI, flightUUID);
  }

  public shared(userId?: string): FlightListSharedService {
    return new FlightListSharedService(this.genericWebService, this.resourceURI, userId);
  }

  public shareRequest(userId?: string): FlightListShareRequestService {
    return new FlightListShareRequestService(this.genericWebService, this.resourceURI, userId);

  }

  constructor(
    private genericWebService: GenericWebServiceService,
    private serviceURI: string,
    private flightListSlug: string
  ) {
    if ( !serviceURI ) {
      throw Error('serviceURI must be a valid string');
    }
    if ( !flightListSlug ) {
      throw Error('flightListSlug must be a valid string');
    }
  }
}

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GenericWebServiceService } from '../generic-web-service.service';
import { FlightList } from '../../classes/flight-list/flight-list';
// import { FlightService } from '../flight/flight.service';

const SERVICE_URI = 'user/flight-list';

@Injectable({
  providedIn: 'root'
})
export class FlightListService {

  private serviceURI = SERVICE_URI;

  private $readAll = this.genericWebService.search<FlightList>(
    this.serviceURI,
    null,
    (data: any[] = []) => data.map(fl => new FlightList(fl)));

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public create(flightList: FlightList): Observable<FlightList> {
    return this.genericWebService.create<FlightList>(
      this.serviceURI,
      flightList
    );
  }

  public readAll(): Observable<FlightList[]> {
    return this.$readAll;
  }

  public get(flightListSlug: string): FlightListFlight {
    // TODO: Add tail by slug
    return new FlightListFlight(flightListSlug, this.genericWebService);
  }
}

class FlightListFlight {
  private get serviceURI(): string {
    return `${SERVICE_URI}/${this.flightListSlug}`;
  }
  private get serviceFlightURI(): string {
    return `${this.serviceURI}/flight`;
  }

  private $resource = this.genericWebService.read<FlightList>(
    this.serviceURI,
    (data: any) => new FlightList(data)
  );


  public read(): Observable<FlightList> {
    return this.$resource;
  }

  public addFlight(flightUuid: string): Observable<void> {
    return this.genericWebService.insert<void>(
      `${this.serviceFlightURI}/${flightUuid}`
    );
  }

  public deleteFlight(flightUuid: string): Observable<void> {
    return this.genericWebService.delete<void>(
      `${this.serviceFlightURI}/${flightUuid}`
    );
  }


  constructor(
    private flightListSlug: string,
    // private flightService: FlightService,
    private genericWebService: GenericWebServiceService
  ) {
    if ( !flightListSlug ) {
      throw Error('flightListSlug must be a valid string');
    }
    this.flightListSlug = flightListSlug;
  }
}

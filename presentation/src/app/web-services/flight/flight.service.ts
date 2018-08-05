import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FlightQuery } from '../../classes/flight/flight-query';
import { Flight } from '../../classes/flight/flight';
import * as moment from 'moment-timezone';


@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public search(
    departureAirportIata: string,
    arrivalAirportIata: string,
    departureDate: Date,
    criteria: FlightQuery = new FlightQuery()
  ): Observable<Flight[]> {

    const serviceURI = `aviation/airport/${departureAirportIata}/to/${arrivalAirportIata}/`
      + (criteria.airlineIata ? `airline/${criteria.airlineIata}/` : '')
      + `flight/${moment(departureDate).format('YYYY-MM-DD')}`;

    return this.genericWebService.search<Flight>(
      serviceURI,
      criteria.toHttpParams(),
      (data: any[] = []): Flight[] => data.map(e => new Flight(e))
    );
  }

  public read(
    uuid: string
  ): Observable<Flight> {

    const serviceURI = `aviation/flight/${uuid}`;

    return this.genericWebService.read<Flight>(
      serviceURI,
      (data: any[]): Flight => (data || []).map(e => new Flight(e))[0]
    );
  }
}

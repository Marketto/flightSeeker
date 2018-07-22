import { Observable } from 'rxjs';
import { AirlineQuery } from '../../classes/airline/airline-query';
import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Airline } from '../../classes/airline/airline';


@Injectable({
  providedIn: 'root'
})
export class AirlineService {

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public search(criteria: AirlineQuery = new AirlineQuery()): Observable<Airline[]> {
    let serviceURI;

    if (criteria.fromAirportIata && criteria.toAirportIata) {
      serviceURI = `aviation/airport/${criteria.fromAirportIata}/to/${criteria.toAirportIata}/airline`;
    } else if (criteria.fromAirportIata || criteria.toAirportIata) {
      serviceURI = `aviation/airport/${criteria.fromAirportIata || criteria.toAirportIata}/airline`;
    } else {
      serviceURI = `aviation/airline`;
    }

    return this.genericWebService.search<Airline>(
        serviceURI,
        criteria.toHttpParams(),
        (data: any[] = []): Airline[] => data.map(e => new Airline(e))
    );
  }

  public read(iata: string): Observable<Airline> {
    const serviceURI = `aviation/airline/${iata}`;

    return this.genericWebService.read<Airline>(
      serviceURI,
      (data: any[] = []): Airline => data.map(e => new Airline(e))[0]
    );
  }
}

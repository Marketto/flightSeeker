import { Airport } from '../../classes/airport/airport';
import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AirportQuery } from '../../classes/airport/airport-query';


const aviationURI = `aviation`;
const resourceURI = `${aviationURI}/airport`;

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(
    private genericWebService: GenericWebServiceService
  ) {}

  public search(criteria: AirportQuery = new AirportQuery()): Observable<Airport[]> {

    const airportURI: String = criteria.linkedAirportIata ? `airport/${criteria.linkedAirportIata}` : null;
    let serviceURI = airportURI ? `${airportURI}` : '';

    if (criteria.byAirlineIata) {
      serviceURI += `${serviceURI ? '/' : ''}airline/${criteria.byAirlineIata}`;
    }

    serviceURI += airportURI ? '/to' : 'airport';

    return this.genericWebService.search<Airport>(
      `${aviationURI}/${serviceURI}`,
      criteria.toHttpParams(),
      (data: any[] = []): Airport[] => data.map(e => new Airport(e))
    );
  }

  public read(iata: string): Observable<Airport> {
    const serviceURI = `${resourceURI}/${iata}`;

    return this.genericWebService.read<Airport>(
      serviceURI,
      (data: any[] = []): Airport => data.map(e => new Airport(e))[0]
    );
  }

}

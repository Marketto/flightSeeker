import { Airport } from './../../class/airport/airport';
import { GenericWebServiceService, API_RESOURCE } from './../generic-web-service.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AirportQuery } from '../../class/airport/airport-query';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const resourceURI = `${API_RESOURCE}/airport`;

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(
    private httpClient: HttpClient,
    private genericWebService: GenericWebServiceService
  ) {}

  public search(criteria: AirportQuery = new AirportQuery()): Observable<Airport[]> {

    const airportURI: string = criteria.linkedAirportIata && `airport/${criteria.linkedAirportIata}`;
    let serviceURI = airportURI ? `/${airportURI}` : '';

    if (criteria.byAirlineIata) {
      serviceURI += `/airline/${criteria.byAirlineIata}`;
    }

    serviceURI += airportURI ? '/to' : '/airport';

    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(API_RESOURCE + serviceURI, {
          ...httpOptions,
          params: criteria ? criteria.toHttpParams() : undefined
        })
      ).subscribe((data: any[]) => {
        observer.next((data || []).map(e => new Airport(e)));
        observer.complete();
      });
    });
  }

  public read(iata: string): Observable<Airport> {
    const serviceURI = `${resourceURI}/${iata}`;

    return Observable.create(observer => {
      return this.genericWebService.webService(
        this.httpClient.get(serviceURI, httpOptions)
      ).subscribe((data: any[]) => {
        observer.next((data || [])[0]);
        observer.complete();
      });
    });
  }

}

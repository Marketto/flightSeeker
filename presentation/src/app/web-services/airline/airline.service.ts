import { Observable } from 'rxjs';
import { AirlineQuery } from './../../class/airline/airline-query';
import { GenericWebServiceService, API_RESOURCE } from './../generic-web-service.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Airline } from '../../class/airline/airline';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class AirlineService {

  constructor(
    private httpClient: HttpClient,
    private genericWebService: GenericWebServiceService
  ) { }

  public search(criteria?: AirlineQuery): Observable<Airline[]> {
    let serviceURI;

    if (criteria.fromAirportIata && criteria.toAirportIata) {
      serviceURI = `${API_RESOURCE}/airport/${criteria.fromAirportIata}/to/${criteria.toAirportIata}/airline`;
    } else if (criteria.fromAirportIata || criteria.toAirportIata) {
      serviceURI = `${API_RESOURCE}/airport/${criteria.fromAirportIata || criteria.toAirportIata}/airline`;
    } else {
      serviceURI = `${API_RESOURCE}/airline`;
    }

    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(serviceURI, {
          ...httpOptions,
          params: criteria ? criteria.toHttpParams() : undefined
        })
      ).subscribe((data: any[]) => {
        observer.next((data || []).map(e => new Airline(e)));
        observer.complete();
      });
    });
  }

  public read(iata: string): Observable<Airline> {
    const serviceURI = `${API_RESOURCE}/airline/${iata}`;

    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(serviceURI)
      ).subscribe((data: any[]) => {
        observer.next((data || [])[0]);
        observer.complete();
      });
    });
  }
}

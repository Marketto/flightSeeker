import * as moment from 'moment-timezone';
import { FlightQuery } from './../../class/flight/flight-query';
import { GenericWebServiceService, API_RESOURCE } from './../generic-web-service.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Flight } from '../../class/flight/flight';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(
    private httpClient: HttpClient,
    private genericWebService: GenericWebServiceService
  ) { }

  public search(
    departureAirportIata: string,
    arrivalAirportIata: string,
    departureDate: Date,
    criteria: FlightQuery = new FlightQuery()
  ): Observable<Flight[]> {

    const serviceURI = `${API_RESOURCE}/airport/${departureAirportIata}/to/${arrivalAirportIata}/`
      + (criteria.airlineIata ? `airline/${criteria.airlineIata}/` : '')
      + `flight/${moment(departureDate).format('YYYY-MM-DD')}`;

    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(serviceURI, {
          ...httpOptions,
          params: criteria ? criteria.toHttpParams() : undefined
        })
      ).subscribe((data: any[]) => {
        observer.next((data || []).map(e => new Flight(e)));
        observer.complete();
      });
    });
  }

  public read(
    uuid: string
  ): Observable<Flight> {

    const serviceURI = `${API_RESOURCE}/flight/${uuid}`;

    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(serviceURI, httpOptions)
      ).subscribe((data: any[]) => {
        observer.next((data || []).map(e => new Flight(e))[0]);
        observer.complete();
      });
    });
  }
}

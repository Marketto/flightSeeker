import { FlightQuery } from './../../class/flight/flight-query';
import { GenericWebServiceService } from './../generic-web-service.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Flight } from '../../class/flight/flight';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
const servicesUrl = 'http://localhost:3000';


@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(
    private httpClient: HttpClient,
    private genericWebService: GenericWebServiceService
  ) { }

  public search(departureAirportIata: string, arrivalAirportIata: string, departureDate: Date, criteria?: FlightQuery = new FlightQuery()) {

    const serviceURI = `${servicesUrl}/airport/${departureAirportIata}/to/${arrivalAirportIata}/`
      + (criteria.airlineIata ? `airline/${criteria.airlineIata}/` : '')
      + `flight/${departureDate.toJSON().substr(0, 10)}`;

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
}

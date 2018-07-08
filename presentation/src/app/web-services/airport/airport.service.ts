import { Airport } from './../../class/airport/airport';
import { GenericWebServiceService } from './../generic-web-service.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AirportQuery } from '../../class/airport/airport-query';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
const servicesUrl = 'http://localhost:3000';

const serviceURI = `${servicesUrl}/airport`;

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(
    private httpClient: HttpClient,
    private genericWebService: GenericWebServiceService
  ) {}

  public search(criteria?: AirportQuery) {
    return Observable.create(observer => {
      this.genericWebService.webService(
        this.httpClient.get(serviceURI, {
          ...httpOptions,
          params: criteria ? criteria.toHttpParams() : undefined
        })
      ).subscribe((data: any[]) => {
        observer.next((data || []).map(e => new Airport(e)));
        observer.complete();
      });
    });
  }

  public read(iata: string) {
    return Observable.create(observer => {
      return this.genericWebService.webService(
        this.httpClient.get(`${serviceURI}/${iata}`, httpOptions)
      ).subscribe((data: any[]) => {
        observer.next((data || [])[0]);
        observer.complete();
      });
    });
  }

}

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GenericWebServiceService } from '../generic-web-service.service';
import { FlightList } from '../../classes/flight-list/flight-list';

@Injectable({
  providedIn: 'root'
})
export class FlightListService {



  private serviceURI = `user/flight-list`;

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public create(flightList: FlightList): Observable<FlightList> {
    return this.genericWebService.create<FlightList>(
      this.serviceURI,
      flightList
    );
  }

  public read(flightListSlug: string): Observable<FlightList> {
    return this.genericWebService.read<FlightList>(
      `${this.serviceURI}/${flightListSlug}`,
      (data: any) => new FlightList(data)
    );
  }

  public readAll(): Observable<FlightList[]> {
    return this.genericWebService.search<FlightList>(
      this.serviceURI,
      null,
      (data: any[] = []) => data.map(fl => new FlightList(fl))
    );
  }
}

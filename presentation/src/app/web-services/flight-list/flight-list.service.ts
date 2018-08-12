import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GenericWebServiceService } from '../generic-web-service.service';
import { FlightList } from '../../classes/flight-list/flight-list';
import { FlightListDetailService } from './flight-list-detail/flight-list-detail.service';

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


  public create(flightList: FlightList): Observable<FlightList> {
    return this.genericWebService.create<FlightList>(
      this.serviceURI,
      flightList
    );
  }

  public readAll(): Observable<FlightList[]> {
    return this.$readAll;
  }

  public bySlug(flightListSlug: string): FlightListDetailService {

    if (!flightListSlug) {
      throw new Error('flightListSlug can\'t be empty');
    }

    return new FlightListDetailService(
      this.genericWebService,
      this.serviceURI,
      flightListSlug
    );
  }

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

}

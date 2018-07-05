import * as moment from 'moment';
import { FlightDetail } from './flight-detail';

export class Flight {
  public totalFlightTime: Duration;
  public totalMiles: number;
  public totalTripTime: Duration;
  public departureDateTime: Date;
  // public departureTimeOffset: "+03:00",
  public departureCode: string;
  public departureName: string;
  public arrivalDateTime: Date;
  // "arrivalTimeOffset": "+02:00",
  public arrivalCode: string;
  public arrivalName: string;
  public flightType: string;
  public departureTimeZone: string;
  public arrivalTimeZone: string;
  public flightLegDetails: FlightDetail[];


  constructor(obj?: any) {
    if (obj) {
      this.totalFlightTime = obj.totalFlightTime && moment.duration(obj.totalFlightTime);
      this.totalMiles = !isNaN(obj.totalMiles) ? parseInt(obj.totalMiles) : undefined;
      this.totalTripTime = obj.totalTripTime && moment.duration(obj.totalTripTime);
      this.departureDateTime = obj.departureDateTime ? moment(obj.departureDateTime).toDate() : undefined;
      this.departureCode = obj.departureCode;
      this.departureName = obj.departureName;
      this.arrivalDateTime = obj.arrivalDateTime ? moment(obj.arrivalDateTime).toDate() : undefined;

    }
  }
}

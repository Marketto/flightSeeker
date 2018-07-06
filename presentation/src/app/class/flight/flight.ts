import * as moment from 'moment-timezone';
import { FlightDetail } from './flight-detail';
import { Duration, Moment } from 'moment-timezone';

export class Flight {
  public totalFlightTime: Duration;
  public totalMiles: number;
  public totalTripTime: Duration;
  public departureDateTime: Moment;
  // public departureTimeOffset: "+03:00",
  public departureCode: string;
  public departureName: string;
  public arrivalDateTime: Moment;
  // "arrivalTimeOffset": "+02:00",
  public arrivalCode: string;
  public arrivalName: string;
  public flightType: string;
  public departureTimeZone: string;
  public arrivalTimeZone: string;
  public flightLegDetails: FlightDetail[];

  public get progress() {
    const diffToNow = moment().diff(this.departureDateTime, 'minutes');
    const diffToArrival = this.totalFlightTime.asMinutes();

    return diffToNow < 0 ? null : (diffToNow > diffToArrival ? 100 : Math.round(diffToNow * 100 / diffToArrival));
  }


  constructor(obj?: any) {
    if (obj) {
      this.totalFlightTime = obj.totalFlightTime && moment.duration(obj.totalFlightTime);
      this.totalMiles = !isNaN(obj.totalMiles) ? Number(obj.totalMiles) : undefined;
      this.totalTripTime = obj.totalTripTime && moment.duration(obj.totalTripTime);
      this.departureDateTime = obj.departureDateTime ? moment.tz(obj.departureDateTime, obj.departureTimeZone) : undefined;
      this.departureTimeZone = obj.departureTimeZone;
      this.departureCode = obj.departureCode;
      this.departureName = obj.departureName;
      this.arrivalDateTime = obj.arrivalDateTime ? moment.tz(obj.arrivalDateTime, obj.arrivalTimeZone) : undefined;
      this.arrivalTimeZone = obj.arrivalTimeZone;
      this.arrivalCode = obj.arrivalCode;
      this.arrivalName = obj.arrivalName;
      this.flightType = obj.flightType;
      this.flightLegDetails = (obj.flightLegDetails || []).map(fd => new FlightDetail(fd));
    }
  }
}

import { Airport } from '../airport/airport';
import * as moment from 'moment-timezone';
import { FlightDetail } from './flight-detail';
import { Duration, Moment } from 'moment-timezone';

export class Flight {
  public totalFlightTime: Duration;
  public totalMiles: number;
  public totalTripTime: Duration;
  public departureDateTime: Moment;
  public departureCode: string;
  public departureName: string;
  public arrivalDateTime: Moment;
  public arrivalCode: string;
  public arrivalName: string;
  public flightType: string;
  public departureTimeZone: string;
  public arrivalTimeZone: string;
  public flightLegDetails: FlightDetail[];
  public departureAirport: Airport;
  public arrivalAirport: Airport;

  public get airlineIata() {
    if (this.flightLegDetails && this.flightLegDetails[0] && this.flightLegDetails[0].marketingAirline) {
      return this.flightLegDetails[0].marketingAirline.iata;
    }
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
      this.departureAirport = obj.departureAirport ? new Airport(obj.departureAirport) : undefined;
      this.arrivalAirport = obj.arrivalAirport ? new Airport(obj.arrivalAirport) : undefined;
    }
  }
}

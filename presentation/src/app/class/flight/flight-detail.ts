import { Airline } from './../airline/airline';
import { Airport } from './../airport/airport';
import * as moment from 'moment';
import { Duration } from 'moment';

export class FlightDetail {
  public departureDateTime: Date;
  // "departureTimeOffset": "+03:00",
  public arrivalDateTime: Date;
  // "arrivalTimeOffset": "+02:00",
  public flightNumber: string;
  public journeyDuration: Duration;
  public sequenceNumber: number;
  public legDistance: number;
  public meals: string;
  public uuid: string;
  public departureAirport: Airport;
  public arrivalAirport: Airport;
  public marketingAirline: Airline;

  constructor (obj?: any) {
    if (obj) {
      this.departureDateTime = obj.departureDateTime && moment(obj.departureDateTime).toDate();
      this.arrivalDateTime = obj.arrivalDateTime && moment(obj.arrivalDateTime).toDate();
      this.flightNumber = obj.flightNumber;
      this.journeyDuration = obj.journeyDuration && moment.duration(obj.journeyDuration);
      this.sequenceNumber = !isNaN(obj.sequenceNumber) ? Number(obj.sequenceNumber) : undefined;
      this.legDistance = !isNaN(obj.legDistance) ? Number(obj.legDistance) : undefined;
      this.meals = obj.meals;
      this.uuid = obj.uuid;
      this.departureAirport = obj.departureAirport ? new Airport(obj.departureAirport) : undefined;
      this.arrivalAirport = obj.arrivalAirport ? new Airport(obj.arrivalAirport) : undefined;
      this.marketingAirline = obj.marketingAirline ? new Airline(obj.marketingAirline) : undefined;

      if (this.departureAirport && obj.departureTimeZone) {
        this.departureAirport.timeZone = obj.departureTimeZone;
      }
      if (this.arrivalAirport && obj.arrivalTimeZone) {
        this.arrivalAirport.timeZone = obj.arrivalTimeZone;
      }
    }
  }
}

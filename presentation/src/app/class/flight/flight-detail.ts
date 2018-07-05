import { Airline } from './../airline/airline';
import { Airport } from './../airport/airport';
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
  public departureTimeZone: string;
  public arrivalTimeZone: string;
  public departureAirport: Airport;
  public arrivalAirport: Airport;
  public marketingAirline: Airline;
}

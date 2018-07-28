import { Airline } from '../airline/airline';
import { FlightVector } from './flight-vector';
import * as moment from 'moment-timezone';
import { Duration } from 'moment';

export class Flight {
  public departure: FlightVector;
  public arrival: FlightVector;
  public airline: Airline;
  public duration: Duration;
  public 'number': number;
  public meals: string;
  public uuid: string;

  constructor(obj?: any) {
    if (obj) {
      this.departure = new FlightVector(obj.departure);
      this.arrival = new FlightVector(obj.arrival);
      this.airline = new Airline(obj.airline);
      this.duration = obj.duration ? moment.duration(obj.duration) : undefined;
      this.number = obj.number;
      this.meals = obj.meals;
      this.uuid = obj.uuid;
    }
  }
}

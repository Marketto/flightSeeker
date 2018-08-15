import { Airline } from '../airline/airline';
import { FlightVector } from './flight-vector';
import * as moment from 'moment-timezone';
import { Duration } from 'moment';

type Meal =
   'B'  // Breakfast
  |'K'  // Continental breakfast
  |'L'  // Lunch
  |'D'  // Dinner
  |'S'  // Snack
  |'M'  // Generic Meal
  |'R'  // Refreshment
  |'C'  // Alcoholic beverages complimentary
  |'F'  // Food for purchase
  |'P'  // Alcoholic beverages for purchase
  |'Y'  // Duty free sales available
  |'N'  // No meal service
  |'V'  // Refreshments for purchase
  |'G'  // Food and beverages for purchase
  |'O'  // Cold meal
  |'H'  // Hot meal
  ;

export class Flight {
  public departure: FlightVector;
  public arrival: FlightVector;
  public airline: Airline;
  public duration: Duration;
  public 'number': number;
  public meals: Meal[];
  public uuid: string;

  constructor(obj?: any) {
    if (obj) {
      this.departure = new FlightVector(obj.departure);
      this.arrival = new FlightVector(obj.arrival);
      this.airline = new Airline(obj.airline);
      this.duration = ( this.departure.dateTime && this.arrival.dateTime ) ?
        moment.duration(this.arrival.dateTime.diff(this.departure.dateTime)) :
        undefined;
      this.number = obj.number;
      this.meals = (obj.meals || '').split('');
      this.uuid = obj.uuid;
    }
  }
}

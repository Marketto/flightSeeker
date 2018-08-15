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

  |'OO'  // Cold meal
  |'OM'  // Cold meal
  |'OB'  // Cold Breakfast
  |'OK'  // Cold Continental breakfast
  |'OL'  // Cold Lunch
  |'OD'  // Cold Dinner

  |'HH'  // Hot meal
  |'HM'  // Hot meal
  |'HB'  // Hot Breakfast
  |'HK'  // Hot Continental breakfast
  |'HL'  // Hot Lunch
  |'HD'  // Hot Dinner

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
      this.meals = obj.meals ? obj.meals.match(/([OH]?[BCDFGKLMNPRSVY]|HH|OO)/ig) : [];
      this.uuid = obj.uuid;
    }
  }
}

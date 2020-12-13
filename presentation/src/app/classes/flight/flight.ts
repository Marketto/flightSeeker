import { Airline } from '../airline/airline';
import { FlightVector } from './flight-vector';
import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment-timezone';
import { Coordinate } from 'tsgeo/Coordinate';
import { Vincenty } from 'tsgeo/Distance/Vincenty';
import { Position } from '../common/position';

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
  public distance: number;
  public 'number': number;
  public meals: Meal[];
  public uuid: string;

  constructor(obj?: any) {
    if (obj) {
      this.departure = new FlightVector(obj.departure);
      this.arrival = new FlightVector(obj.arrival);
      this.airline = new Airline(obj.airline);
      this.duration = this.getDuration(this.departure.dateTime, this.arrival.dateTime);
      this.number = obj.number;
      this.meals = Array.isArray(obj.meals) ? obj.meals : (obj.meals || '').split('');
      this.uuid = obj.uuid;
      this.distance = (this.departure.airport && this.arrival.airport) ?
        this.getDistance(this.departure.airport.position, this.arrival.airport.position) : 0;
    }
  }

  private getDistance(
    position1: Position,
    position2: Position
  ): number {
    if (position1 && position2) {
      const coordinate1 = new Coordinate(position1.latitude, position1.longitude);
      const coordinate2 = new Coordinate(position2.latitude, position2.longitude);

      return coordinate1.getDistance(coordinate2, new Vincenty());
    }
    return 0;
  }

  private getDuration(
    dateTime1: Moment, dateTime2: Moment
  ): Duration {
    if (dateTime1 && dateTime2) {
      return moment.duration(dateTime2.diff(dateTime1));
    }
    return undefined;
  }
}

import { Airport } from '../airport/airport';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';

export class FlightVector {
  public airport: Airport;
  public dateTime: Moment;
  public terminal: string|number;

  constructor (obj?: any) {
    if (obj) {
      this.airport = new Airport(obj.airport);
      this.dateTime = obj.dateTime ? moment(obj.dateTime).tz(this.airport.timeZone) : null;
      this.terminal = obj.terminal;
    }
  }
}

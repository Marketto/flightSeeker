import { Airport } from '../airport/airport';
import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment';

export class FlightVector {
  public airport: Airport;
  public dateTime: Moment;
  public delay: Duration;
  public terminal: string|number;


  constructor (obj?: any) {
    if (obj) {
      this.airport = new Airport(obj.airport);
      this.dateTime = obj.dateTime ? moment(obj.dateTime).tz(this.airport.timeZone) : undefined;
      this.terminal = obj.terminal;
      this.delay = moment.duration(obj.delay || 'PT0S');

      if (this.dateTime && this.delay) {
        this.dateTime.add(this.delay);
      }
    }
  }
}

import { Airport } from '../airport/airport';
import * as moment from 'moment';
import { Moment, Duration } from 'moment-timezone';

export class FlightVector {
  public airport: Airport;
  public dateTime: Moment;
  public delay: Duration;
  public offset: string;
  public terminal: string|number;


  constructor (obj?: any) {
    if (obj) {
      this.airport = new Airport(obj.airport);
      this.offset = obj.offset ? moment().utcOffset(obj.offset).format('Z') : undefined;
      this.dateTime = obj.dateTime ? moment(obj.dateTime).utcOffset(this.offset) : undefined;
      this.terminal = obj.terminal;
      this.delay = moment.duration(obj.delay || 'PT0S');

      if (this.dateTime && this.delay) {
        this.dateTime.add(this.delay);
      }
    }
  }
}

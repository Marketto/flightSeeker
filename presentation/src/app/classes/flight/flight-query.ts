import { HttpParams } from '@angular/common/http';
import { Search } from '../search';
import { Moment } from 'moment-timezone';

export class FlightQuery extends Search {
  public airlineIata: string;
  public after: Moment;
  public at: Moment;
  public limit: number;

  constructor(obj?: FlightQuery|{
    airlineIata?: string,
    after?: Moment,
    at?: Moment,
    limit?: number
  }) {
    super();
    if (obj) {
      this.airlineIata = obj.airlineIata;
      this.after = obj.after;
      this.at = obj.at;
      this.limit = obj.limit;
    }
  }

  public toHttpParams() {
    let params = new HttpParams();

    if (this.after || this.at) {
      params = params.set(this.after ? 'after' : 'at', (this.after || this.at).local().format('HH:mm'));
    }
    if (this.limit) {
      params = params.set('limit', this.limit.toString());
    }

    return params;
  }
}

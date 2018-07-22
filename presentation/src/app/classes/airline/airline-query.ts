import { HttpParams } from '@angular/common/http';
import { Search } from '../search';
// import { queryParam } from '../query-parm';

export class AirlineQuery extends Search{
  public startsWith: string;
  // @queryParam(false)
  public fromAirportIata: string;
  // @queryParam(false)
  public toAirportIata: string;

  constructor(obj?: AirlineQuery | any) {
    super();
    if (obj) {
      this.startsWith = obj.startsWith;
      this.fromAirportIata = obj.fromAirportIata;
      this.toAirportIata = obj.toAirportIata;
    }
  }

  public toHttpParams() {
    let params = new HttpParams();
    if (this.startsWith) {
      params = params.append('startsWith', this.startsWith);
    }
    return params;
  }
}

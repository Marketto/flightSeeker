import { HttpParams } from '@angular/common/http';
import { Search } from './../search';

export class AirportQuery extends Search {
  public startsWith: string;
  public notInCity: string;
  public linkedAirportIata: string;
  public byAirlineIata: string;

  constructor(obj?: AirportQuery|any) {
    super();
    if (obj) {
      this.startsWith = obj.startsWith;
      this.notInCity = obj.notInCity;
      this.linkedAirportIata = obj.linkedAirportIata;
      this.byAirlineIata = obj.byAirlineIata;
    }
  }

  public toHttpParams() {
    let params = new HttpParams();

    ['startsWith','notInCity'].forEach(key => {
      const param = key.replace(/^\$/, '');
      if (this[param]) {
        params = params.set(param, this[param]);
      }
    });

    return params;
  }
}

import { Search } from '../search';

export class FlightQuery extends Search {
  public airlineIata: string;
  public after: Date;
  public at: Date;

  constructor(obj?: FlightQuery|any) {
    super();
    if (obj) {
      this.airlineIata = obj.airlineIata;
      this.after = obj.after;
      this.at = obj.at;
    }
  }
}

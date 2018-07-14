import { Search } from './../search';

export class AirportQuery extends Search {
  public startsWith: string;
  public notInCity: string;

  constructor(obj?: AirportQuery|any) {
    super();
    if (obj) {
      this.startsWith = obj.startsWith;
      this.notInCity = obj.notInCity;
    }
  }
}

import { Position } from '../common/position';
export class Airport {
  public _id: string;
  public name: string;
  public city: string;
  public country: string;
  public iata: string;
  public icao: string;
  public timeZone: string;
  public countryCode: string;
  public cityIata: string;
  public position: Position;

  constructor(obj?: any) {
    if (obj) {
      this._id = obj._id;
      this.name = obj.name || obj.locationName;
      this.city = obj.city;
      this.country = obj.country;
      this.iata = obj.iata || obj.locationCode;
      this.icao = obj.icao;
      this.timeZone = obj.timeZone || obj.tz;
      this.countryCode = obj.countryCode;
      this.cityIata = obj.cityIata;
      this.position = obj.position ? new Position(obj.position) : undefined;
    }
  }
}

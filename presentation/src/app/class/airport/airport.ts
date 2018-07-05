export class Airport {
  public _id: string;
  public name: string;
  public city: string;
  public country: string;
  public iata: string;
  public icao: string;
  public latitude: number;
  public longitude: number;
  public altitude: number;
  public timeZone: string;
  public countryCode: string;
  public cityIata: string;
  public terminal: string;

  constructor(obj?: any) {
    if (obj) {
      this._id = obj._id;
      this.name = obj.name || obj.locationName;
      this.city = obj.city;
      this.country = obj.country;
      this.iata = obj.iata || obj.locationCode;
      this.icao = obj.icao;
      this.latitude = obj.latitude;
      this.longitude = obj.longitude;
      this.altitude = obj.altitude;
      this.timeZone = obj.timeZone || obj.tz;
      this.countryCode = obj.countryCode;
      this.cityIata = obj.cityIata;
      this.terminal = obj.terminal;
    }
  }
}

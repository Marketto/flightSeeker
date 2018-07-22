export class Airline {
  public name: string;
  public iata: string;
  public countryCode: string;

  constructor(obj?: any) {
    if (obj) {
      this.name = obj.name || obj.companyShortName;
      this.iata = obj.iata || obj.code;
      this.countryCode = obj.countryCode;
    }
  }
}

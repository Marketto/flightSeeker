export class FlightList {
  public name: string;
  public slug: string;
  public shared: string[];
  public owner: string;
  public flights: string[];

  constructor(obj?: any) {
    if (obj) {
      this.name = obj.name;
      this.slug = obj.slug;
      this.shared = obj.shared;
      this.owner = obj.owner;
      this.flights = obj.flights;
    }
  }
}

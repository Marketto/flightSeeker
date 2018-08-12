import { Flight } from '../flight/flight';
import { UserSummary } from '../user/user-summary';

export class FlightList {
  public name: string;
  public slug: string;
  public shared: UserSummary[];
  public shareRequest: UserSummary[];
  public owner: UserSummary;
  public flights: Flight[];

  constructor(obj?: any) {
    if (obj) {
      this.name = obj.name;
      this.slug = obj.slug;
      this.shared = (obj.shared || []).map(user => new UserSummary(user));
      this.shareRequest = (obj.shareRequest || []).map(user => new UserSummary(user));
      this.owner = new UserSummary(obj.owner);
      this.flights = (obj.flights || []).map(flight => new Flight(flight));
    }
  }
}

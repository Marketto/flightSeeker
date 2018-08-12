export class UserSummary {
  public _id: string;
  public name: string;

  constructor(obj?: any) {
    if (obj) {
      this._id = obj._id;
      this.name = obj.name;
    }
  }
}

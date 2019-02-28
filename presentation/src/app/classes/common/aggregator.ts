import { isObject, isString } from 'util';

export class Aggregator {
  public name: string;
  public count: number;

  constructor(objOrName: string|object = {name: '', count: 0}, count: number = 0) {
    if (objOrName && count && isString(objOrName)) {
      this.name = String(objOrName);
      this.count = count;
    } else if (objOrName && isObject(objOrName)) {
      this.name = Object(objOrName).name;
      this.count = Object(objOrName).count;
    }
  }
}

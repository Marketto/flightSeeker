import { isObject, isArray } from 'util';
import { Point } from './point';
export class Position {
  public latitude:  number;
  public longitude: number;
  public altitude: number;

  public get lonLat(): number[] {
    return [this.longitude, this.latitude];
  }

  public get latLon(): number[] {
    return [this.latitude, this.longitude];
  }

  public get xy(): Point {
    return new Point(this.longitude, this.latitude);
  }

  constructor(obj?: any) {
    if (obj) {
      if (isArray(obj) && obj.length === 2) {
        this.latitude = obj[1];
        this.longitude = obj[0];
      } else if (isObject(obj)) {
        this.latitude = obj.latitude;
        this.longitude = obj.longitude;
        this.altitude = obj.altitude;
      }
    }
  }
}

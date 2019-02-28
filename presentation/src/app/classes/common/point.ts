import { isNumber, isObject } from 'util';

export class Point {
  public x: number;
  public y: number;

  constructor(objOrX?: object|number, y?: number) {
    if (isNumber(objOrX) && isNumber(y)) {
      this.x = Number(objOrX);
      this.y = y;
    } else if (isObject(objOrX)) {
      this.x = Object(objOrX).x;
      this.y = Object(objOrX).y;
    }
  }
}

import { isNumber, isObject } from 'util';

export class Point {
  public x: number;
  public y: number;

  constructor(objOrX?: any, y?: number) {
    if (objOrX && y && isNumber(objOrX) && isNumber(y)) {
      this.x = objOrX;
      this.y = y;
    } else if (objOrX && isObject(objOrX)) {
      this.x = objOrX.x;
      this.y = objOrX.y;
    }
  }
}

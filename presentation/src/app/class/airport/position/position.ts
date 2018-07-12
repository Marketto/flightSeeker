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

  constructor(obj?: any) {
    if (obj) {
      this.latitude = obj.latitude;
      this.longitude = obj.longitude;
      this.altitude = obj.altitude;
    }
  }
}

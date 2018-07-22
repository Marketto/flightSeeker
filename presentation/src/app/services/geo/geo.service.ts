import { Position } from '../../classes/common/position';
import { Injectable } from '@angular/core';
import * as Arc from 'arc';
import { Feature, LineString } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  constructor() { }

  public geoArc(
    position1: Position,
    position2: Position,
    definition: number = 100,
    parameters: object = {}
  ): Feature<LineString> {
    const start = position1.xy;
    const end = position2.xy;

    const greatCircle = new Arc.GreatCircle(start, end, parameters);
    const arcLine = greatCircle.Arc(definition, { offset: 10 });

    return arcLine.json() as Feature<LineString>;
  }
}

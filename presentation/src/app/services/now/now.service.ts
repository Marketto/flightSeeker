import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';

const MID_TIME_INTERVAL = 1 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class NowService {
  private midTimeInterval = interval(MID_TIME_INTERVAL).pipe<Moment>(map(() => new moment.tz()));

  public get midTime(): Observable<Moment> {
    return this.midTimeInterval;
  }
}

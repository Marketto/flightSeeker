import * as moment from 'moment-timezone';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import { Moment } from 'moment-timezone';
import { NowService } from '../../services/now/now.service';
import { Duration } from 'moment-timezone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.scss']
})
export class FlightDetailComponent implements OnInit, OnDestroy {
  private $flight: Flight;

  @Input()
  public set flight(flight: Flight) {
    this.$flight = flight;

    this.subscribeNowMidTime();

    this.calculateDurations();
  }
  public get flight() {
    return this.$flight;
  }

  private now: Moment = new moment();
  private nowMidTimetSubscription: Subscription;
  public timeToDepartureLeft: Duration;
  public timeToArrivalLeft: Duration;
  public progress: number;
  @Output() progressChange = new EventEmitter<number>();

  private calculateDurations() {
    const departureDT = this.flight.departureDateTime;
    const arrivalDT = this.flight.arrivalDateTime;
    const flightTotalDuration = this.flight.totalTripTime.asMinutes();

    this.timeToDepartureLeft = departureDT.diff(this.now, 'minutes');
    this.timeToArrivalLeft = arrivalDT.diff(this.now, 'minutes');

    this.progress = departureDT > this.now ? null : (
      this.now >= arrivalDT ? 100 : Math.round((flightTotalDuration - this.timeToArrivalLeft) * 100 / flightTotalDuration)
    );
    this.progressChange.emit(this.progress);
  }

  constructor(
    private nowService: NowService
  ) {

  }

  private subscribeNowMidTime() {
    if (!this.nowMidTimetSubscription || (this.nowMidTimetSubscription && this.nowMidTimetSubscription.closed)) {
      this.nowMidTimetSubscription = this.nowService.midTime.subscribe(now => {
        this.now = now;

        this.calculateDurations();
        if (this.progress === 100 && !this.nowMidTimetSubscription.closed) {
          this.nowMidTimetSubscription.unsubscribe();
        }
      });
    }
  }

  ngOnInit() {
    this.subscribeNowMidTime();
  }
  ngOnDestroy() {
    if (!this.nowMidTimetSubscription.closed) {
      this.nowMidTimetSubscription.unsubscribe();
    }
  }
}

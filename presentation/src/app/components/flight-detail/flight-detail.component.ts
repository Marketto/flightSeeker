import { FlightListService } from '../../web-services/flight-list/flight-list.service';
import { AuthService } from '../../services/auth/auth.service';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import { NowService } from '../../services/now/now.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment-timezone';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.scss']
})
export class FlightDetailComponent implements OnInit, OnDestroy {
  private $flight: Flight;

  @Input() public addToFlightListButton: boolean;
  @Input() public removeFromFlightListButton: boolean;
  @Output() public removeFromFlightList = new EventEmitter<Flight>();
  @Input()
  public set flight(flight: Flight) {
    this.$flight = flight;

    this.calculateDurations();

    if (this.progress === 100) {
      this.showProgressBar = !(this.progress === 100 && this.timeToArrivalLeft.asHours() < -24);
    } else {
      this.subscribeNowMidTime();
    }
  }
  public get flight() {
    return this.$flight;
  }

  private now: Moment = moment();
  private nowMidTimetSubscription: Subscription;
  public timeToDepartureLeft: Duration;
  public timeToArrivalLeft: Duration;
  public progress: number;
  public addToFlightListItems: MenuItem[] = [];
  public removeFromFlightListItems: MenuItem[] = [];
  public showProgressBar = true;
  @Output() progressChange = new EventEmitter<number>();

  private calculateDurations() {
    const departureDT = this.flight.departure.dateTime;
    const arrivalDT = this.flight.arrival.dateTime;
    const flightTotalDuration = this.flight.duration.asMinutes();

    this.timeToDepartureLeft = moment.duration(departureDT.diff(this.now));
    this.timeToArrivalLeft = moment.duration(arrivalDT.diff(this.now));

    this.progress = departureDT > this.now ? null : (
      this.now >= arrivalDT ? 100 : Math.round((flightTotalDuration - this.timeToArrivalLeft.asMinutes()) * 100 / flightTotalDuration)
    );
    this.progressChange.emit(this.progress);
  }

  public get authenticated() {
    return this.authService.isAuthenticated;
  }

  public get addToFlightListDisabled(): boolean {
    return !this.addToFlightListItems.some(atfi => !atfi.disabled);
  }

  constructor(
    private nowService: NowService,
    private authService: AuthService,
    private flightListService: FlightListService
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

  private retrieveUserFlightLists() {
    if (this.authService.isAuthenticated) {
      this.flightListService.readAll().then(flightList => {
        this.addToFlightListItems = flightList.map(fli => {
          const isDisabled = () => fli.flights.some((flight: Flight) => flight.uuid === this.flight.uuid);
          const atfli = {
            label: fli.name,
            command: () => this.flightListService.bySlug(fli.slug).flight()
              .insert(this.flight.uuid)
              .then(() => {
                fli.flights.unshift(this.flight);
                atfli.disabled = isDisabled();
              }),
            disabled: isDisabled()
          };
          return atfli;
        });

        this.removeFromFlightListItems = flightList.map(fli => {
          return {
            'label': fli.name,
            'command': () => this.flightListService.bySlug(fli.slug).flight(this.flight.uuid)
              .delete().then(() => this.removeFromFlightList.emit(this.flight))
          };
        });
      });
    }
  }

  ngOnInit() {
    this.retrieveUserFlightLists();
  }
  ngOnDestroy() {
    if (this.nowMidTimetSubscription && !this.nowMidTimetSubscription.closed) {
      this.nowMidTimetSubscription.unsubscribe();
    }
  }
}

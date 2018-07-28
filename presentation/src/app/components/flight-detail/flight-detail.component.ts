import { FlightListService } from '../../web-services/flight-list/flight-list.service';
import { AuthService } from '../../services/auth/auth.service';
import * as moment from 'moment-timezone';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import { Moment, Duration } from 'moment';
import { NowService } from '../../services/now/now.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';

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
  public addToFlightListItems: MenuItem[] = [];
  public removeFromFlightListItems: MenuItem[] = [];
  @Output() progressChange = new EventEmitter<number>();

  private calculateDurations() {
    const departureDT = this.flight.departure.dateTime;
    const arrivalDT = this.flight.arrival.dateTime;
    const flightTotalDuration = this.flight.duration.asMinutes();

    this.timeToDepartureLeft = departureDT.diff(this.now, 'minutes');
    this.timeToArrivalLeft = arrivalDT.diff(this.now, 'minutes');

    this.progress = departureDT > this.now ? null : (
      this.now >= arrivalDT ? 100 : Math.round((flightTotalDuration - this.timeToArrivalLeft) * 100 / flightTotalDuration)
    );
    this.progressChange.emit(this.progress);
  }

  public get authenticated() {
    return this.authService.isAuthenticated;
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
      this.flightListService.readAll().subscribe(flightList => {
        this.addToFlightListItems = flightList.map(fli => {
          return {
            'label': fli.name,
            'command': () => {
              const addFlightSubscription = this.flightListService.get(fli.slug).addFlight(this.flight.uuid).subscribe(() => {
                if (addFlightSubscription) {
                  addFlightSubscription.unsubscribe();
                }
              });
            }
          };
        });

        this.removeFromFlightListItems = flightList.map(fli => {
          return {
            'label': fli.name,
            'command': () => {
              const removeFlightSubscription = this.flightListService.get(fli.slug).deleteFlight(this.flight.uuid).subscribe(() => {
                if (removeFlightSubscription) {
                  this.removeFromFlightList.emit(this.flight);
                  removeFlightSubscription.unsubscribe();
                }
              });
            }
          };
        });
      });
    }
  }

  ngOnInit() {
    this.subscribeNowMidTime();
    this.retrieveUserFlightLists();
  }
  ngOnDestroy() {
    if (!this.nowMidTimetSubscription.closed) {
      this.nowMidTimetSubscription.unsubscribe();
    }
  }
}

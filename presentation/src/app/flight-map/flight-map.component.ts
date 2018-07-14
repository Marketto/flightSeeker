import { Position } from './../class/airport/position/position';
import { Flight } from './../class/flight/flight';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NowService } from '../services/now.service';
import { Moment } from 'moment-timezone';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.component.html',
  styleUrls: ['./flight-map.component.scss']
})
export class FlightMapComponent implements OnInit, OnDestroy {
  private $flight: Flight;
  private nowMidTimetSubscription: Subscription;
  public currentPosition: Position;

  @Input() public set flight(flight: Flight) {
    this.$flight = flight;

    this.subscribeNowMidTime();
    this.estimatePosition(new moment());
  }
  public get flight() {
    return this.$flight;
  }


  private estimatePosition(now: Moment) {
    if (this.flight) {
      const departureDT: Moment = this.flight.departureDateTime;
      const arrivalDT: Moment = this.flight.arrivalDateTime;

      if (departureDT > now) {
        this.currentPosition = this.flight.departureAirport.position;
      } else if (arrivalDT < now) {
        this.currentPosition = this.flight.arrivalAirport.position;
      } else {
        const flightProgress: number = now.diff(departureDT, 'seconds') / this.flight.totalTripTime.asSeconds();

        const departureLongitude: number = this.flight.departureAirport.position.longitude;
        const departureLatitude: number = this.flight.departureAirport.position.latitude;
        const arrivalLongitude: number = this.flight.arrivalAirport.position.longitude;
        const arrivalLatitude: number = this.flight.arrivalAirport.position.latitude;

        this.currentPosition = new Position({
          'latitude': departureLatitude + (arrivalLatitude - departureLatitude) * flightProgress,
          'longitude': departureLongitude + (arrivalLongitude - departureLongitude) * flightProgress
        });
      }
    } else {
      console.warn('No flight');
    }
  }


  constructor(
    private nowService: NowService
  ) { }

  private subscribeNowMidTime() {
    if (!this.nowMidTimetSubscription || (this.nowMidTimetSubscription && this.nowMidTimetSubscription.closed)) {
      this.nowMidTimetSubscription = this.nowService.midTime.subscribe(now => {
        this.estimatePosition(now);
        if (this.flight && this.currentPosition === this.flight.arrivalAirport.position && !this.nowMidTimetSubscription.closed) {
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

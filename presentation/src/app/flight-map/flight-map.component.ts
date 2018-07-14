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
  private now: Moment = new moment();
  private nowMidTimetSubscription: Subscription;
  public currentPosition: Position;

  @Input() public set flight(flight: Flight) {
    this.$flight = flight;

    this.estimatePosition();
  }
  public get flight() {
    return this.$flight;
  }


  private estimatePosition() {
    if (this.flight) {
      const departureDT: Moment = this.flight.departureDateTime;
      const arrivalDT: Moment = this.flight.arrivalDateTime;

      if (departureDT > this.now) {
        return new Position(this.flight.departureAirport.position);
      } else if (arrivalDT < this.now) {
        return new Position(this.flight.arrivalAirport.position);
      } else {
        const flightProgress: number = this.now.diff(departureDT, 'seconds') / this.flight.totalTripTime.asSeconds();

        const departureLongitude: number = this.flight.departureAirport.position.longitude;
        const departureLatitude: number = this.flight.departureAirport.position.latitude;
        const arrivalLongitude: number = this.flight.arrivalAirport.position.longitude;
        const arrivalLatitude: number = this.flight.arrivalAirport.position.latitude;

        this.currentPosition = new Position({
          'latitude': departureLatitude + (arrivalLatitude - departureLatitude) * flightProgress,
          'longitude': departureLongitude + (arrivalLongitude - departureLongitude) * flightProgress
        });
      }
    }
  }


  constructor(
    private nowService: NowService
  ) { }

  ngOnInit() {
    this.nowMidTimetSubscription = this.nowService.midTime.subscribe(now => {
      this.now = now;

      this.estimatePosition();
    });
  }
  ngOnDestroy() {
    this.nowMidTimetSubscription.unsubscribe();
  }

}

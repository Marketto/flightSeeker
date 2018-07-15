import { GeoService } from './../services/geo.service';
import { Position } from './../class/airport/position/position';
import { Flight } from './../class/flight/flight';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NowService } from '../services/now.service';
import { Moment } from 'moment-timezone';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { LineString, Feature } from 'geojson';

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.component.html',
  styleUrls: ['./flight-map.component.scss']
})
export class FlightMapComponent implements OnInit, OnDestroy {
  private $flight: Flight;
  private nowMidTimetSubscription: Subscription;
  public currentPosition: Position;
  public route: Feature<LineString>;

  @Input() public set flight(flight: Flight) {
    this.$flight = flight;

    this.subscribeNowMidTime();

    this.route = this.geoService.geoArc(flight.departureAirport.position, flight.arrivalAirport.position, flight.totalTripTime.asMinutes());

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
      } else if (this.route) {
        const flightProgress: number = now.diff(departureDT, 'seconds') / this.flight.totalTripTime.asSeconds();
        const flightProgressFloor = Math.floor(flightProgress * this.route.geometry.coordinates.length);
        const flightProgressCeil = Math.ceil(flightProgress * this.route.geometry.coordinates.length);

        const startLongitude: number = this.route.geometry.coordinates[flightProgressFloor][0];
        const startLatitude: number = this.route.geometry.coordinates[flightProgressFloor][1];
        const endLongitude: number = this.route.geometry.coordinates[flightProgressCeil][0];
        const endLatitude: number = this.route.geometry.coordinates[flightProgressCeil][1];

        this.currentPosition = new Position({
          'latitude': startLatitude + (endLatitude - startLatitude) * flightProgress,
          'longitude': startLongitude + (endLongitude - startLongitude) * flightProgress
        });
      }
    } else {
      console.warn('No flight');
    }
  }


  constructor(
    private nowService: NowService,
    private geoService: GeoService
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

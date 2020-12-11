import { GeoService } from '../../services/geo/geo.service';
import { Position } from '../../classes/common/position';
import { Flight } from '../../classes/flight/flight';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NowService } from '../../services/now/now.service';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
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

    this.route = this.geoService.geoArc(flight.departure.airport.position, flight.arrival.airport.position, flight.duration.asMinutes());

    this.estimatePosition(moment());
  }
  public get flight() {
    return this.$flight;
  }


  private estimatePosition(now: Moment) {
    if (this.flight) {
      const departureDT: Moment = this.flight.departure.dateTime;
      const arrivalDT: Moment = this.flight.arrival.dateTime;

      if (departureDT > now) {
        this.currentPosition = this.flight.departure.airport.position;
      } else if (arrivalDT < now) {
        this.currentPosition = this.flight.arrival.airport.position;
      } else if (this.route) {
        const flightProgress: number = now.diff(departureDT, 'seconds') / this.flight.duration.asSeconds();
        const coordinates = this.route.geometry.coordinates;
        const flightProgressFloor = Math.max(0, Math.floor(flightProgress * coordinates.length));
        const flightProgressCeil = Math.min(coordinates.length - 1, Math.ceil(flightProgress * coordinates.length));

        const [startLongitude, startLatitude]: number[] = coordinates[flightProgressFloor];
        const [endLongitude, endLatitude]: number[] = coordinates[flightProgressCeil];

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
        if (this.flight && this.currentPosition === this.flight.arrival.airport.position && !this.nowMidTimetSubscription.closed) {
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

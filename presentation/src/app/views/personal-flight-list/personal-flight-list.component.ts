import { AuthService } from './../../services/auth/auth.service';
import { FlightListService } from '../../web-services/flight-list/flight-list.service';
import { ActivatedRoute } from '@angular/router';
import { Aggregator } from '../../classes/common/aggregator';
import { FlightList } from '../../classes/flight-list/flight-list';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment-timezone';
import { NowService } from '../../services/now/now.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-flight-list',
  templateUrl: './personal-flight-list.component.html',
  styleUrls: ['./personal-flight-list.component.scss']
})
export class PersonalFlightListComponent implements OnInit, OnDestroy {
  private static DISTANCE_MULTIPLIER = 0.001; // meters to Km
  private static MOST_FREQUENT_DESTINATIONS_TO_DISPLAY = 3;
  private flightListSlug: string;
  private $unauthorized: 'unauthorized'|'pending'|'guest';
  private nowMidTimetSubscription: Subscription;
  private now: Moment = new moment();
  public flightList: FlightList;
  public totalDuration: Duration;
  public currentFlight: Flight;
  public totalFlights = 0;
  public totalDistance = 0;
  public mostFrequentDestinationCities: Aggregator[];
  public mostFrequentDestinationCountries: Aggregator[];

  private subscribeNowMidTime() {
    if (!this.nowMidTimetSubscription || (this.nowMidTimetSubscription && this.nowMidTimetSubscription.closed)) {
      this.nowMidTimetSubscription = this.nowService.midTime.subscribe(now => {
        this.now = now;

        const currentFlightChanged = this.updateCurrentFlight();
        if (this.currentFlight || currentFlightChanged) {
          this.calculateDynamicTotals();
          if (currentFlightChanged && this.currentFlight) {
            this.calculateTotals();
          }
        }
        if (this.totalFlights === this.flightList.flights.length && !this.nowMidTimetSubscription.closed) {
          this.nowMidTimetSubscription.unsubscribe();
        }
      });
    }
  }

  private calculateTotals() {
    if (this.flightList) {
      const performedFlights: Flight[] = this.flightList.flights
        .filter((flight: Flight) => flight.arrival.dateTime.isSameOrBefore(this.now) || flight === this.currentFlight);

      this.totalFlights = performedFlights.length;

      if (performedFlights.length > 1) {
        const groupedByCity = this.groupFlightsBy(performedFlights, flight => flight.arrival.airport.city);
        this.mostFrequentDestinationCities = groupedByCity.slice(1, PersonalFlightListComponent.MOST_FREQUENT_DESTINATIONS_TO_DISPLAY + 1);
        const performedOutwardFlights = performedFlights.filter((flight: Flight) => flight.arrival.airport.city !== groupedByCity[0].name);
        this.mostFrequentDestinationCountries = this.groupFlightsBy(performedOutwardFlights, flight => flight.arrival.airport.country)
          .slice(0, PersonalFlightListComponent.MOST_FREQUENT_DESTINATIONS_TO_DISPLAY);
      }
    }
  }

  private calculateDynamicTotals() {
    if (this.flightList) {
      const performedFlights: Flight[] = this.flightList.flights
        .filter((flight: Flight) => flight.arrival.dateTime.isSameOrBefore(this.now));

      this.totalDuration = moment.duration(
        [0, 0].concat(
          performedFlights
            .map(flight => flight.duration.asMinutes())
        ).reduce((d1: number, d2: number) => d1 + d2),
         'minutes'
      );

      this.totalDistance = Math.round(performedFlights
        .map((flight: Flight) => flight.distance)
        .reduce(
          (totDistance: number, currentDistance: number) => totDistance + currentDistance) *
          PersonalFlightListComponent.DISTANCE_MULTIPLIER
        );

      if (this.currentFlight) {
        const currentFlightElapsedTime = moment.duration(this.now.diff(this.currentFlight.departure.dateTime));
        const currentFlightDuration = this.currentFlight.duration.asMinutes();

        this.totalDuration = this.totalDuration.add(currentFlightElapsedTime);
        this.totalDistance += Math.round(
          currentFlightElapsedTime.asMinutes() * this.currentFlight.distance *
          PersonalFlightListComponent.DISTANCE_MULTIPLIER / currentFlightDuration
        );
      }
    }
  }

  private groupFlightsBy(flightList: Flight[], mapper: (flight: Flight) => string): Aggregator[] {
    return flightList
      .filter((flight: Flight, index: number, flights: Flight[]) => {
        return flights.findIndex((f: Flight) => mapper(f) === mapper(flight)) === index;
      }).map((flight: Flight) => {
        const count = flightList.filter((f: Flight) => mapper(f) === mapper(flight)).length;
        return new Aggregator(mapper(flight), count);
      }).sort((a: Aggregator, b: Aggregator) => a.count > b.count ? -1 : (b.count > a.count ? 1 : 0));
  }

  private updateCurrentFlight(): boolean {
    if (this.flightList) {
      const currentFlight = (this.flightList.flights || []).find((flight: Flight) => {
        return this.now.isBetween(
          flight.departure.dateTime,
          flight.arrival.dateTime
        );
      });
      if (this.currentFlight !== currentFlight) {
        this.currentFlight = currentFlight;
        return true;
      }
    }
    return false;
  }

  public pullFlight(flight: Flight) {
    this.flightList.flights.splice(
      this.flightList.flights.indexOf(flight)
      , 1);
  }

  public sendShareRequest() {
    this.flightListService.bySlug(this.flightListSlug).shareRequest().create().subscribe(() => {
      this.$unauthorized = 'pending';
    });
  }


  public acceptShareRequest(userId: string) {
    this.flightListService.bySlug(this.flightListSlug).shared().insert(userId).subscribe(() => {
      const flShareRequest = this.flightList.shareRequest;
      const [newShared] = flShareRequest.splice(flShareRequest.findIndex(uid => uid._id === userId), 1);
      this.flightList.shared.push(newShared);
    });
  }
  public declineShareRequest(userId: string) {
    this.flightListService.bySlug(this.flightListSlug).shareRequest(userId).delete().subscribe(() => {
      const flShareRequest = this.flightList.shareRequest;
      flShareRequest.splice(flShareRequest.findIndex(uid => uid._id === userId), 1);
    });
  }
  public revokeShare(userId: string) {
    this.flightListService.bySlug(this.flightListSlug).shared(userId).delete().subscribe(() => {
      const flShared = this.flightList.shared;
      flShared.splice(flShared.findIndex(uid => uid._id === userId), 1);
    });
  }

  public get unauthorized() {
    return !this.authService.isAuthenticated || this.$unauthorized;
  }


  constructor(
    private nowService: NowService,
    private activeRoute: ActivatedRoute,
    private flightListService: FlightListService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated) {
      const flightListSlug = this.activeRoute.snapshot.params.flightListSlug;
      if (flightListSlug) {
        this.flightListService.bySlug(flightListSlug).read().subscribe((flightList: FlightList) => {
          // authorized
          this.flightList = flightList;
          this.flightListSlug = flightListSlug;
          this.updateCurrentFlight();
          this.calculateTotals();
          this.calculateDynamicTotals();
          this.subscribeNowMidTime();
        }, ({status}) => {
          this.flightListSlug = flightListSlug;
          if (status === 401) {
            this.$unauthorized = 'unauthorized';
          } else if (status === 406) {
            this.$unauthorized = 'pending';
          }
        });
      }
    } else {
      this.$unauthorized = 'guest';
    }
  }

  ngOnDestroy() {
    if (!this.nowMidTimetSubscription.closed) {
      this.nowMidTimetSubscription.unsubscribe();
    }
  }
}

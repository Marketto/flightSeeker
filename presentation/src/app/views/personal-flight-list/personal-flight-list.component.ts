import { AuthService } from './../../services/auth/auth.service';
import { FlightListService } from '../../web-services/flight-list/flight-list.service';
import { ActivatedRoute } from '@angular/router';
import { FlightList } from '../../classes/flight-list/flight-list';
import { Component, OnInit } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import * as moment from 'moment-timezone';
import { Duration } from 'moment';

@Component({
  selector: 'app-personal-flight-list',
  templateUrl: './personal-flight-list.component.html',
  styleUrls: ['./personal-flight-list.component.scss']
})
export class PersonalFlightListComponent implements OnInit {

  private flightListSlug: string;

  public flightList: FlightList;
  public unauthorized: Boolean = false;

  public get totalDuration(): Duration {
    if (this.flightList) {
      return moment.duration(
        [0, 0].concat(
          this.flightList.flights
            .filter((flight: Flight) => flight.arrival.dateTime.isSameOrBefore())
            .map(flight => flight.duration.asMinutes())
        ).reduce((d1: number, d2: number) => d1 + d2),
         'minutes'
      );
    }
  }

  public get currentFlight(): Flight {
    if (this.flightList) {
      return (this.flightList.flights || []).find((flight: Flight) => {
        const now = moment();
        return now.isBetween(
          flight.departure.dateTime,
          flight.arrival.dateTime
        );
      });
    }
  }

  public get authenticated() {
    return this.authService.isAuthenticated;
  }

  public pullFlight(flight: Flight) {
    this.flightList.flights.splice(
      this.flightList.flights.indexOf(flight)
      , 1);
  }

  public sendShareRequest() {
    this.flightListService.bySlug(this.flightListSlug).shareRequest().create().subscribe();
  }


  public acceptShareRequest(userId: string) {
    this.flightListService.bySlug(this.flightListSlug).shared().insert(userId).subscribe(() => {
      const flShareRequest = this.flightList.shareRequest;
      flShareRequest.splice(flShareRequest.findIndex(uid => uid._id === userId), 1);
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


  constructor(
    private activeRoute: ActivatedRoute,
    private flightListService: FlightListService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const flightListSlug = this.activeRoute.snapshot.params.flightListSlug;
    if (flightListSlug) {
      this.flightListService.bySlug(flightListSlug).read().subscribe((flightList: FlightList) => {
        this.flightList = flightList;
        this.flightListSlug = flightListSlug;
      }, ({status}) => {
        if (status === 401) {

          this.flightListSlug = flightListSlug;
          this.unauthorized = true;
        }
      });
    }
  }

}

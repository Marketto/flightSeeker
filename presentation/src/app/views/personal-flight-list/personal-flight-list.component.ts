import { FlightListService } from './../../web-services/flight-list/flight-list.service';
import { ActivatedRoute } from '@angular/router';
import { FlightList } from './../../classes/flight-list/flight-list';
import { Component, OnInit } from '@angular/core';
import { Flight } from '../../classes/flight/flight';
import * as moment from 'moment';

@Component({
  selector: 'app-personal-flight-list',
  templateUrl: './personal-flight-list.component.html',
  styleUrls: ['./personal-flight-list.component.scss']
})
export class PersonalFlightListComponent implements OnInit {

  public flightList: FlightList;

  public get currentFlight(): Flight {
    if (this.flightList) {
      return (this.flightList.flights || []).find(flight => {
        const now = moment();
        return now.isBetween(
          moment(flight.departure.dateTime).add(-2, 'hours'),
          moment(flight.arrival.dateTime).add(2, 'hours')
        );
      });
    }
  }

  public pullFlight(flight: Flight) {
    this.flightList.flights.splice(
      this.flightList.flights.indexOf(flight)
      , 1);
  }

  constructor(
    private activeRoute: ActivatedRoute,
    private flightListService: FlightListService
  ) { }

  ngOnInit() {
    const flightListSlug = this.activeRoute.snapshot.params.flightListSlug;
    if (flightListSlug) {
      this.flightListService.get(flightListSlug).read().subscribe((flightList: FlightList) => {
        this.flightList = flightList;
      });
    }
  }

}
